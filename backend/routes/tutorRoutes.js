const express        = require("express");
const router         = express.Router();
const tutorCtrl      = require("../controllers/tutorController");
const authMiddleware = require("../middleware/authMiddleware");

// specific string routes BEFORE /:id wildcard
router.get("/all",                               tutorCtrl.getAllTutors);
router.get("/search",                            tutorCtrl.searchTutors);
router.get("/profile",   authMiddleware,         tutorCtrl.getProfile);
router.patch("/profile", authMiddleware,         tutorCtrl.updateProfile);
router.get("/stats",     authMiddleware,         tutorCtrl.getStats);
router.get("/requests",  authMiddleware,         tutorCtrl.getRequests);
router.get("/students",  authMiddleware,         tutorCtrl.getStudents);
router.post("/add",                              tutorCtrl.addTutor);
router.patch("/requests/:id/accept",  authMiddleware, tutorCtrl.acceptRequest);
router.patch("/requests/:id/decline", authMiddleware, tutorCtrl.declineRequest);

// wildcard LAST
router.get("/:id",                               tutorCtrl.getTutorById);

module.exports = router;