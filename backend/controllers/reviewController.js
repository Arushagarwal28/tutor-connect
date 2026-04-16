const Review     = require("../models/Review");
const Enrollment = require("../models/Enrollment");
const Tutor      = require("../models/Tutor");
const mongoose   = require("mongoose");


// ════════════════════════════════════════════════════════════
// POST /api/reviews
// Protected (student) — submit a review for an active tutor
// ════════════════════════════════════════════════════════════
exports.createReview = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { tutorId, rating, text } = req.body;

    if (!tutorId || !rating || !text) {
      return res.status(400).json({ message: "tutorId, rating, and text are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (text.trim().length < 10) {
      return res.status(400).json({ message: "Review text must be at least 10 characters" });
    }

    // Must have active enrollment
    const enrollment = await Enrollment.findOne({ studentId, tutorId, activeStatus: true });
    if (!enrollment) {
      return res.status(403).json({
        message: "You can only review tutors you are actively enrolled with",
      });
    }

    // Create review — unique index blocks duplicates
    let review;
    try {
      review = await Review.create({
        studentId,
        tutorId,
        enrollmentId: enrollment._id,
        rating:       Number(rating),
        text:         text.trim(),
      });
    } catch (dupErr) {
      if (dupErr.code === 11000) {
        return res.status(400).json({ message: "You have already reviewed this tutor" });
      }
      throw dupErr;
    }

    // Recalculate tutor's running average rating
    const tutorObjectId = new mongoose.Types.ObjectId(tutorId);
    const agg = await Review.aggregate([
      { $match: { tutorId: tutorObjectId } },
      { $group: { _id: "$tutorId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    if (agg.length > 0) {
      await Tutor.findByIdAndUpdate(tutorId, {
        rating:       Math.round(agg[0].avgRating * 10) / 10,
        totalReviews: agg[0].count,
      });
    }

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// GET /api/reviews/homepage
// Public — 6 most recent 4+ star reviews for the homepage
// ════════════════════════════════════════════════════════════
exports.getHomepageReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ rating: { $gte: 4 } })
      .populate("studentId", "name class board")
      .populate("tutorId",   "name subjects")
      .sort({ createdAt: -1 })
      .limit(6);

    const shaped = reviews.map(r => ({
      id:          r._id,
      rating:      r.rating,
      text:        r.text,
      studentName: r.studentId?.name        || "Student",
      studentRole: r.studentId?.class
        ? `Class ${r.studentId.class} · ${r.studentId.board}`
        : "Student",
      tutorName:   r.tutorId?.name          || "Tutor",
      subject:     r.tutorId?.subjects?.[0] || "",
      initials:    (r.studentId?.name || "S").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      dateLabel:   new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
    }));

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// GET /api/reviews/mine
// Protected (student) — all reviews by the logged-in student
// ════════════════════════════════════════════════════════════
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ studentId: req.user.id })
      .populate("tutorId", "name subjects")
      .sort({ createdAt: -1 });

    const shaped = reviews.map(r => ({
      id:        r._id,
      tutorId:   r.tutorId?._id,
      tutorName: r.tutorId?.name          || "Tutor",
      subject:   r.tutorId?.subjects?.[0] || "",
      rating:    r.rating,
      text:      r.text,
      dateLabel: new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
    }));

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// GET /api/reviews/tutor/:tutorId
// Public — all reviews for a specific tutor (for profile page)
// ════════════════════════════════════════════════════════════
exports.getTutorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tutorId: req.params.tutorId })
      .populate("studentId", "name class board")
      .sort({ createdAt: -1 });

    const shaped = reviews.map(r => ({
      id:           r._id,
      rating:       r.rating,
      text:         r.text,
      studentName:  r.studentId?.name  || "Student",
      studentClass: r.studentId?.class || "",
      studentBoard: r.studentId?.board || "",
      initials:     (r.studentId?.name || "S").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      dateLabel:    new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
    }));

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};