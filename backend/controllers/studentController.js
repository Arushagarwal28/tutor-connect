const Student    = require("../models/Student");
const Tutor      = require("../models/Tutor");
const Enrollment = require("../models/Enrollment");

// ── GET /api/student/profile ─────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate("enrolledTutors", "name subjects teachingMode qualification verifiedStatus rating");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── PATCH /api/student/profile ───────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const ALLOWED = ["name", "phone", "class", "board"];

    const updates = {};
    ALLOWED.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // ── Update location if lat/lng provided ──────────────
    const { latitude, longitude } = req.body;
    if (latitude != null && longitude != null) {
      updates.location = {
        type:        "Point",
        coordinates: [Number(longitude), Number(latitude)],  // GeoJSON [lng, lat]
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Profile updated successfully", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── POST /api/student/enroll/:tutorId ────────────────────
exports.enrollTutor = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { tutorId } = req.params;
    const { subject = "", message = "" } = req.body;

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const existing = await Enrollment.findOne({ studentId, tutorId });
    if (existing) {
      return res.status(400).json({
        message: existing.activeStatus
          ? "You are already enrolled with this tutor"
          : "You already have a pending request with this tutor",
      });
    }

    const enrollment = await Enrollment.create({
      studentId, tutorId, subject, message,
      confirmedByStudent: true, confirmedByTutor: false, activeStatus: false,
    });

    await Student.findByIdAndUpdate(studentId, { $addToSet: { enrolledTutors: tutorId } });

    res.status(201).json({ message: "Enrollment request sent successfully", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── GET /api/student/enrollments ─────────────────────────
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id })
      .populate("tutorId", "name qualification subjects teachingMode verifiedStatus rating fee coverageRadius")
      .sort({ createdAt: -1 });

    const shaped = enrollments.map(e => {
      const tutor      = e.tutorId;
      const name       = tutor?.name || "Unknown Tutor";
      const initials   = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      const daysActive = Math.floor((Date.now() - new Date(e.startDate)) / (1000 * 60 * 60 * 24));
      return {
        id:            e._id,
        _id:           e._id,
        tutorId:       tutor?._id,
        name,
        initials,
        detail:        [tutor?.subjects?.slice(0, 2).join(", "), tutor?.teachingMode].filter(Boolean).join(" · "),
        enrolledDate:  new Date(e.startDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
        daysActive,
        subject:       e.subject || "",
        message:       e.message || "",
        status:        e.activeStatus ? "active" : "pending",
        avatarBg:      "#dbeafe",
        avatarColor:   "#1d4ed8",
        qualification: tutor?.qualification || "",
        verified:      tutor?.verifiedStatus || false,
        rating:        tutor?.rating || 0,
        fee:           tutor?.fee ? `₹${tutor.fee.toLocaleString("en-IN")}` : "—",
      };
    });

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── DELETE /api/student/enrollments/:enrollmentId ────────
exports.cancelEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id:       req.params.enrollmentId,
      studentId: req.user.id,
    });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    if (enrollment.activeStatus) {
      return res.status(400).json({
        message: "Cannot cancel an active enrollment. Please contact the tutor.",
      });
    }
    const tutorId = enrollment.tutorId;
    await enrollment.deleteOne();
    await Student.findByIdAndUpdate(req.user.id, { $pull: { enrolledTutors: tutorId } });
    res.json({ message: "Enrollment request cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── GET /api/student/stats ───────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [activeCount, pendingCount, totalCount] = await Promise.all([
      Enrollment.countDocuments({ studentId, activeStatus: true }),
      Enrollment.countDocuments({ studentId, activeStatus: false, confirmedByTutor: false }),
      Enrollment.countDocuments({ studentId }),
    ]);
    res.json({ activeTutors: activeCount, pendingTutors: pendingCount, totalTutors: totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};