const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({

  // Who wrote it
  studentId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Student",
    required: true,
  },

  // Who it's about
  tutorId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Tutor",
    required: true,
  },

  // Must be an active enrollment — prevents fake/spam reviews
  enrollmentId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      "Enrollment",
    required: true,
  },

  rating: {
    type:     Number,
    required: true,
    min:      1,
    max:      5,
  },

  text: {
    type:      String,
    required:  true,
    minlength: 10,
    maxlength: 1000,
    trim:      true,
  },

}, { timestamps: true });

// One review per student per tutor — no duplicate reviews
ReviewSchema.index({ studentId: 1, tutorId: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);