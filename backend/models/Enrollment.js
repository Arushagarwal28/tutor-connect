const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  tutorId:   { type: mongoose.Schema.Types.ObjectId, ref: "Tutor",   required: true },

  // Subject the student wants to learn
  subject:  { type: String, default: "" },
  // Optional message from student to tutor when sending request
  message:  { type: String, default: "" },

  startDate: { type: Date, default: Date.now },

  // Two-step confirmation: both parties must confirm for activeStatus to go true
  confirmedByTutor:   { type: Boolean, default: false },
  confirmedByStudent: { type: Boolean, default: true  }, // student confirms by requesting

  // true only when BOTH sides have confirmed
  activeStatus: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);