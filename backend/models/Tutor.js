const mongoose = require("mongoose");

const TutorSchema = new mongoose.Schema({
  name:     String,
  email:    { type: String, unique: true },
  phone:    String,
  password: String,

  qualification:  String,
  experience:     Number,
  subjects:       [String],
  board:          String,

  teachingMode:   String,
  coverageRadius: Number,

  achievements: String,
  demoVideo:    String,

  
  location: {
    type: {
      type:    String,
      enum:    ["Point"],
      default: "Point",
    },
    coordinates: {
      type:    [Number],   // [longitude, latitude]
      default: [0, 0],
    },
  },

  // ── Stats fields ──────────────────────────────────────
  activeStudents: { type: Number, default: 0 },
  totalStudents:  { type: Number, default: 0 },

  rating:         { type: Number, default: 0 },
  totalReviews:   { type: Number, default: 0 },

  fee:            { type: Number, default: 0 },

  verifiedStatus: { type: Boolean, default: false },
}, { timestamps: true });

// 2dsphere index enables $near / $geoWithin queries
TutorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Tutor", TutorSchema);