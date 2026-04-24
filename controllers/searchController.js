const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");
const logActivity = require("../utils/activityLogger");

// ─── ADVANCED SEARCH WITH AGGREGATION PIPELINE ───────────
exports.advancedSearch = async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = 1,
      limit = 10
    } = req.query;

    // Step 1: Build match filter
    const matchStage = { isPublished: true };

    if (category) matchStage.category = category;
    if (level) matchStage.level = level;
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = Number(minPrice);
      if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }
    if (search) matchStage.$text = { $search: search };

    // Step 2: Sort options
    const sortOptions = {
      popular:    { enrollmentCount: -1 },
      rating:     { rating: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 }
    };

    const sortStage = search
      ? { score: { $meta: "textScore" } }
      : (sortOptions[sortBy] || { createdAt: -1 });

    // Step 3: Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },

      // Join instructor details from users collection
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructorData"
        }
      },

      { $unwind: "$instructorData" },

      // Select only fields we need
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          category: 1,
          level: 1,
          thumbnail: 1,
          enrollmentCount: 1,
          rating: 1,
          tags: 1,
          createdAt: 1,
          "instructorData.name": 1,
          "instructorData.email": 1,
          ...(search && { score: { $meta: "textScore" } })
        }
      },

      { $sort: sortStage },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    ];

    // Step 4: Run pipeline
    const courses = await Course.aggregate(pipeline);

    // Step 5: Count total for pagination
    const totalPipeline = [
      { $match: matchStage },
      { $count: "total" }
    ];
    const totalResult = await Course.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    if (req.user && search) logActivity(req.user.id, 'search', null, { query: search });

    res.json({
      courses,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (err) {
    console.error("AdvancedSearch error:", err);
    res.status(500).json({ message: "Error in advanced search" });
  }
};


// ─── CATEGORY STATS ───────────────────────────────────────
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Course.aggregate([
      // Only count published courses
      { $match: { isPublished: true } },

      // Group by category
      {
        $group: {
          _id: "$category",
          totalCourses:    { $sum: 1 },
          avgPrice:        { $avg: "$price" },
          avgRating:       { $avg: "$rating" },
          totalEnrollments:{ $sum: "$enrollmentCount" }
        }
      },

      // Rename _id to category
      {
        $project: {
          category:         "$_id",
          totalCourses:     1,
          avgPrice:         { $round: ["$avgPrice", 2] },
          avgRating:        { $round: ["$avgRating", 2] },
          totalEnrollments: 1,
          _id: 0
        }
      },

      // Most courses first
      { $sort: { totalCourses: -1 } }
    ]);

    res.json(stats);

  } catch (err) {
    console.error("GetCategoryStats error:", err);
    res.status(500).json({ message: "Error fetching category stats" });
  }
};


// ─── STUDENT DASHBOARD DATA ───────────────────────────────
exports.getDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const dashboard = await Enrollment.aggregate([
      // Only this student's enrollments
      { $match: { user: userId } },

      // Join course details
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseData"
        }
      },

      { $unwind: "$courseData" },

      // Join instructor details
      {
        $lookup: {
          from: "users",
          localField: "courseData.instructor",
          foreignField: "_id",
          as: "instructorData"
        }
      },

      { $unwind: "$instructorData" },

      // Shape the final output
      {
        $project: {
          enrolledAt:      1,
          progress:        1,
          isCompleted:     1,
          lastAccessedAt:  1,
          "courseData.title":       1,
          "courseData.thumbnail":   1,
          "courseData.category":    1,
          "courseData.level":       1,
          "instructorData.name":    1
        }
      },

      // Most recently accessed first
      { $sort: { lastAccessedAt: -1 } }
    ]);

    // Summary stats
    const totalEnrolled  = dashboard.length;
    const totalCompleted = dashboard.filter(e => e.isCompleted).length;
    const avgProgress    = totalEnrolled > 0
      ? Math.round(dashboard.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled)
      : 0;

    res.json({
      summary: { totalEnrolled, totalCompleted, avgProgress },
      enrollments: dashboard
    });

  } catch (err) {
    console.error("GetDashboardData error:", err);
    res.status(500).json({ message: "Error fetching dashboard" });
  }
};