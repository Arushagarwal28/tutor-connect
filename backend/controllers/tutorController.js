const Tutor      = require("../models/Tutor");
const Enrollment = require("../models/Enrollment");

// ── GET /api/tutors/all ──────────────────────────────────
exports.getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().select("-password");
    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── GET /api/tutors/search ───────────────────────────────
// Query params:
//   subject, mode, rating           – text/value filters
//   lat, lng, maxDistance           – geo filter (metres)
//                                     maxDistance default = 5000 m (5 km)
exports.searchTutors = async (req, res) => {
  try {
    const { subject, mode, rating, lat, lng, maxDistance } = req.query;
    const query = {};

    if (subject) query.subjects     = { $in: [subject] };
    if (mode)    query.teachingMode = mode;
    if (rating)  query.rating       = { $gte: Number(rating) };

    // ── Geo filter ────────────────────────────────────────
    // Only apply when the student provides their GPS position.
    // For home-tutors we also honour their coverageRadius:
    //   we search within max(studentRadius, tutor.coverageRadius)
    // but since Mongo can't compare two doc fields in $near we do a
    // two-step approach:
    //   1. Run $near with the student's requested radius
    //   2. The client additionally filters on tutor.coverageRadius when
    //      rendering cards (handled in TutorSearchSection)
    if (lat != null && lng != null) {
      const radiusMetres = maxDistance ? Number(maxDistance) : 5000;
      query.location = {
        $near: {
          $geometry: {
            type:        "Point",
            coordinates: [Number(lng), Number(lat)],  // GeoJSON: [lng, lat]
          },
          $maxDistance: radiusMetres,
        },
      };
    }

    const tutors = await Tutor.find(query).select("-password");

    // Attach distance_m to each tutor when geo query was used
    // ($near returns docs sorted closest-first but doesn't attach distance)
    // We compute it in JS using the Haversine formula.
    if (lat != null && lng != null) {
      const sLat = Number(lat);
      const sLng = Number(lng);
      const withDist = tutors.map(t => {
        const obj  = t.toObject();
        const [tLng, tLat] = t.location?.coordinates || [0, 0];
        obj.distance_m = haversineMetres(sLat, sLng, tLat, tLng);
        return obj;
      });
      // Already sorted by $near but re-sort just in case
      withDist.sort((a, b) => a.distance_m - b.distance_m);
      return res.json(withDist);
    }

    res.json(tutors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── GET /api/tutors/profile ──────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user.id).select("-password");
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json(tutor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── PATCH /api/tutors/profile ────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const ALLOWED = [
      "name", "phone", "qualification", "experience",
      "subjects", "board", "teachingMode", "coverageRadius",
      "achievements", "demoVideo", "fee",
    ];

    const updates = {};
    ALLOWED.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // ── Update location if lat/lng provided ──────────────
    const { latitude, longitude } = req.body;
    if (latitude != null && longitude != null) {
      updates.location = {
        type:        "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    res.json({ message: "Profile updated successfully", tutor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── PATCH /api/student/profile ── (location update for students) ──
// This is handled in studentController; documented here for reference.


// ── GET /api/tutors/stats ────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const tutor   = await Tutor.findById(tutorId).select("-password");
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const [activeCount, pendingCount, totalCount] = await Promise.all([
      Enrollment.countDocuments({ tutorId, activeStatus: true }),
      Enrollment.countDocuments({ tutorId, confirmedByTutor: false, confirmedByStudent: true }),
      Enrollment.countDocuments({ tutorId }),
    ]);

    res.json({
      activeStudents:  activeCount,
      totalStudents:   totalCount,
      pendingRequests: pendingCount,
      rating:          tutor.rating       || 0,
      totalReviews:    tutor.totalReviews || 0,
      verifiedStatus:  tutor.verifiedStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── GET /api/tutors/requests ─────────────────────────────
exports.getRequests = async (req, res) => {
  try {
    const requests = await Enrollment.find({
      tutorId:            req.user.id,
      confirmedByTutor:   false,
      confirmedByStudent: true,
    })
      .populate("studentId", "name class board email phone")
      .sort({ createdAt: -1 });

    const shaped = requests.map(r => ({
      _id:        r._id,
      id:         r._id,
      name:       r.studentId?.name    || "Unknown Student",
      initials:   (r.studentId?.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      classBoard: `Class ${r.studentId?.class || "—"} · ${r.studentId?.board || "—"}`,
      subject:    r.subject  || "—",
      message:    r.message  || "",
      sentAgo:    timeAgo(r.createdAt),
      avatarBg:   "#dbeafe",
      avatarColor:"#1d4ed8",
    }));

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── PATCH /api/tutors/requests/:id/accept ────────────────
exports.acceptRequest = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, tutorId: req.user.id });
    if (!enrollment) return res.status(404).json({ message: "Request not found" });

    enrollment.confirmedByTutor = true;
    enrollment.activeStatus     = true;
    await enrollment.save();

    await Tutor.findByIdAndUpdate(req.user.id, { $inc: { activeStudents: 1, totalStudents: 1 } });

    res.json({ message: "Request accepted", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── PATCH /api/tutors/requests/:id/decline ───────────────
exports.declineRequest = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, tutorId: req.user.id });
    if (!enrollment) return res.status(404).json({ message: "Request not found" });
    await enrollment.deleteOne();
    res.json({ message: "Request declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── GET /api/tutors/students ─────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ tutorId: req.user.id, activeStatus: true })
      .populate("studentId", "name class board email phone")
      .sort({ createdAt: -1 });

    const shaped = enrollments.map(e => {
      const daysActive = Math.floor((Date.now() - new Date(e.startDate)) / (1000 * 60 * 60 * 24));
      return {
        id:         e._id,
        studentId:  e.studentId?._id,
        name:       e.studentId?.name  || "Unknown",
        initials:   (e.studentId?.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
        classBoard: `Class ${e.studentId?.class || "—"} · ${e.studentId?.board || "—"}`,
        since:      new Date(e.startDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
        days:       daysActive,
        status:     daysActive >= 30 ? "active" : "enrolled",
        avatarBg:   "#dbeafe",
        avatarColor:"#1d4ed8",
      };
    });

    res.json(shaped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── POST /api/tutors/add ─────────────────────────────────
exports.addTutor = async (req, res) => {
  try {
    const tutor = new Tutor(req.body);
    await tutor.save();
    res.json({ message: "Tutor added", tutor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ── GET /api/tutors/:id ──────────────────────────────────
exports.getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id).select("-password");
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json(tutor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════

function timeAgo(date) {
  const secs = Math.floor((Date.now() - new Date(date)) / 1000);
  if (secs < 60)    return `${secs}s ago`;
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

/**
 * Haversine formula — returns distance in metres between two GPS points.
 * @param {number} lat1  Latitude  of point A (degrees)
 * @param {number} lng1  Longitude of point A (degrees)
 * @param {number} lat2  Latitude  of point B (degrees)
 * @param {number} lng2  Longitude of point B (degrees)
 */
function haversineMetres(lat1, lng1, lat2, lng2) {
  const R  = 6_371_000; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a  =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Export for use in other modules if needed
exports.haversineMetres = haversineMetres;