const Course = require("../models/Course");

// ─── CREATE COURSE ────────────────────────────────────────
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

    if (!title || !description || !price || !category) {
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

    res.status(201).json({ message: "Course created successfully", course });

  } catch (err) {
    console.error("CreateCourse error:", err);
    res.status(500).json({ message: "Error creating course" });
  }
};

// ─── GET ALL COURSES ──────────────────────────────────────
exports.getAllCourses = async (req, res) => {
  try {
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

    if (search) {
      filter.$text = { $search: search };
    }

    // ✅ Fixed page and limit conversion
    const skip = (Number(page) - 1) * Number(limit);

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .skip(skip)
      .limit(Number(limit))
      // ✅ Sort by relevance when searching, by date otherwise
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .select(search ? { score: { $meta: "textScore" } } : {});

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (err) {
    console.error("GetAllCourses error:", err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// ─── GET SINGLE COURSE ────────────────────────────────────
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);

  } catch (err) {
    console.error("GetCourseById error:", err);
    res.status(500).json({ message: "Error fetching course" });
  }
};

// ─── UPDATE COURSE ────────────────────────────────────────
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Block sensitive fields from being updated manually
    delete req.body.instructor;
    delete req.body.isPublished;
    delete req.body.enrollmentCount;

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: "Course updated", course: updated });

  } catch (err) {
    console.error("UpdateCourse error:", err);
    res.status(500).json({ message: "Error updating course" });
  }
};

// ─── DELETE COURSE ────────────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: "Course deleted successfully" });

  } catch (err) {
    console.error("DeleteCourse error:", err);
    res.status(500).json({ message: "Error deleting course" });
  }
};

// ─── PUBLISH COURSE ───────────────────────────────────────
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

    res.json({ message: "Course published successfully" });

  } catch (err) {
    console.error("PublishCourse error:", err);
    res.status(500).json({ message: "Error publishing course" });
  }
};

// ─── GET MY COURSES ───────────────────────────────────────
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    res.json(courses);

  } catch (err) {
    console.error("GetMyCourses error:", err);
    res.status(500).json({ message: "Error fetching your courses" });
  }
};