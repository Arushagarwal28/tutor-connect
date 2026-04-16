const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name:  String,
  class: String,
  board: String,

  email: { type: String, unique: true },
  phone: String,

  password: String,

  location: {
    type: {
      type:    String,
      enum:    ["Point"],
      default: "Point",
    },
    coordinates: {
      type:    [Number],
      default: [0, 0],
    },
  },

  enrolledTutors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Tutor",
    },
  ],
});

StudentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Student", StudentSchema);