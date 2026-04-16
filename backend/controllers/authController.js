const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const Tutor   = require("../models/Tutor");
const Student = require("../models/Student");

const JWT_SECRET = process.env.JWT_SECRET;


// ════════════════════════════════════════════════════════════
// POST /api/auth/register-student
// ════════════════════════════════════════════════════════════
exports.registerStudent = async (req, res) => {
  try {
    const {
      name, email, password,
      class: studentClass, board,
      latitude, longitude,          // optional GPS from browser
    } = req.body;

    if (!name || !email || !password || !studentClass || !board) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      password: hashedPassword,
      class:    studentClass,
      board,
    });

    // Store GPS coordinates if provided
    if (latitude != null && longitude != null) {
      student.location = {
        type:        "Point",
        coordinates: [Number(longitude), Number(latitude)],  // GeoJSON: [lng, lat]
      };
    }

    await student.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// POST /api/auth/register-tutor
// ════════════════════════════════════════════════════════════
exports.registerTutor = async (req, res) => {
  try {
    const {
      name, email, password, qualification, subjects,
      teachingMode, coverageRadius, experience, fee,
      boards, achievements, demoVideo,
      latitude, longitude,          // optional GPS from browser
    } = req.body;

    if (!name || !email || !password || !qualification) {
      return res.status(400).json({
        message: "Name, email, password and qualification are required",
      });
    }

    const existingTutor   = await Tutor.findOne({ email });
    const existingStudent = await Student.findOne({ email });
    if (existingTutor || existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tutor = new Tutor({
      name,
      email,
      password:       hashedPassword,
      qualification,
      subjects:       subjects       || [],
      teachingMode:   teachingMode   || "",
      coverageRadius: coverageRadius ? Number(coverageRadius) : 0,
      experience:     experience     ? Number(experience)     : 0,
      fee:            fee            ? Number(fee)            : 0,
      board:          boards
        ? (Array.isArray(boards) ? boards.join(", ") : boards)
        : "",
      achievements:   achievements   || "",
      demoVideo:      demoVideo      || "",
    });

    // Store GPS coordinates if provided
    if (latitude != null && longitude != null) {
      tutor.location = {
        type:        "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    await tutor.save();

    res.status(201).json({ message: "Tutor registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// POST /api/auth/login
// ════════════════════════════════════════════════════════════
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = await Student.findOne({ email });
    let role = "student";
    if (!user) {
      user = await Tutor.findOne({ email });
      role = "tutor";
    }
    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      role,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};