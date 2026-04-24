const Course = require("../models/Course");
const User = require("../models/User");
const redis = require("../config/redis");
const notify = require("../utils/notify");
const emailService = require("../utils/emailService");
const logActivity = require("../utils/activityLogger");

/* Helper to generate cache key */
const generateCacheKey = (prefix, obj) => {
  return `${prefix}:${JSON.stringify(obj)}`;
};

/* Helper to clear course caches */
const clearCourseCache = async () => {
  try {
    const keys = await redis.keys("courses:*");
    if (keys.length > 0) {
      await redis.del(...keys); // ✅ FIXED
    }
  } catch (err) {
    console.error("Cache clear error:", err);
  }
};

/* ─── CREATE COURSE ──────────────────────────────────────── */
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      modules,
      tags
    } = req.body;

    if (!title || !description || price === undefined || price === null || price === '' || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const course = await Course.create({
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      modules,
      tags,
      instructor: req.user.id
    });

    await clearCourseCache();

    res.status(201).json({ message: "Course created successfully", course });

  } catch (err) {
    console.error("CreateCourse error:", err);
    res.status(500).json({ message: "Error creating course" });
  }
};

/* ─── GET ALL COURSES (WITH CACHE) ───────────────────────── */
exports.getAllCourses = async (req, res) => {
  try {
    const cacheKey = generateCacheKey("courses", req.query);

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit");
      return res.json(JSON.parse(cached));
    }

    const {
      search,
      category,
      level,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search && search.trim() !== "") {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort(search ? { score: { $meta: "textScore" } } : { rating: -1, enrollmentCount: -1 })
      .select(search ? { score: { $meta: "textScore" } } : {});

    const total = await Course.countDocuments(filter);

    const response = {
      courses,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 60);

    res.json(response);

  } catch (err) {
    console.error("GetAllCourses error:", err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

/* ─── GET SINGLE COURSE (WITH CACHE) ─────────────────────── */
exports.getCourseById = async (req, res) => {
  try {
    const cacheKey = `course:${req.params.id}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit (single course)");
      return res.json(JSON.parse(cached));
    }

    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await redis.set(cacheKey, JSON.stringify(course), "EX", 60);

    if (req.user) logActivity(req.user.id, 'view', req.params.id);

    res.json(course);

  } catch (err) {
    console.error("GetCourseById error:", err);
    res.status(500).json({ message: "Error fetching course" });
  }
};

/* ─── UPDATE COURSE ──────────────────────────────────────── */
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

   const { title, description, price, category, level, thumbnail, modules, tags } = req.body;

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, price, category, level, thumbnail, modules, tags },
      { new: true, runValidators: true }
    );

    await redis.del(`course:${req.params.id}`);
    await clearCourseCache();

    notify.broadcast("course:updated", { course: updated });

    res.json({ message: "Course updated", course: updated });

  } catch (err) {
    console.error("UpdateCourse error:", err);
    res.status(500).json({ message: "Error updating course" });
  }
};

/* ─── DELETE COURSE ──────────────────────────────────────── */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const deletedId = req.params.id;
    await Course.findByIdAndDelete(deletedId);

    await redis.del(`course:${deletedId}`);
    await clearCourseCache();

    notify.broadcast("course:deleted", { courseId: deletedId });

    res.json({ message: "Course deleted successfully" });

  } catch (err) {
    console.error("DeleteCourse error:", err);
    res.status(500).json({ message: "Error deleting course" });
  }
};

/* ─── PUBLISH COURSE ─────────────────────────────────────── */
exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    course.isPublished = true;
    await course.save();

    await redis.del(`course:${req.params.id}`);
    await clearCourseCache();

    const published = await Course.findById(req.params.id).populate("instructor", "name email");
    notify.broadcast("course:published", { course: published });
    notify.broadcast("notification", {
      message: `📢 New course: "${published.title}" by ${published.instructor?.name}`,
      time: new Date(),
    });

    // Email instructor
    if (published.instructor?.email) {
      emailService.sendCoursePublished(
        published.instructor.email,
        published.instructor.name,
        published.title
      );
    }

    // Email all students about the new course (fire-and-forget)
    User.find({ role: "student" }).select("name email").then((students) => {
      for (const student of students) {
        emailService.sendNewCourseNotification(
          student.email,
          student.name,
          published.title,
          published.instructor?.name || "an instructor"
        );
      }
    }).catch((err) => console.error("New course student notify error:", err.message));

    res.json({ message: "Course published successfully" });

  } catch (err) {
    console.error("PublishCourse error:", err);
    res.status(500).json({ message: "Error publishing course" });
  }
};

/* ─── GET MY COURSES ─────────────────────────────────────── */
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    res.json(courses);

  } catch (err) {
    console.error("GetMyCourses error:", err);
    res.status(500).json({ message: "Error fetching your courses" });
  }
};
