const express        = require("express");
const router         = express.Router();
const studentCtrl    = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/profile",                      authMiddleware, studentCtrl.getProfile);
router.patch("/profile",                    authMiddleware, studentCtrl.updateProfile);
router.get("/enrollments",                  authMiddleware, studentCtrl.getEnrollments);
router.get("/stats",                        authMiddleware, studentCtrl.getStats);
router.post("/enroll/:tutorId",             authMiddleware, studentCtrl.enrollTutor);
router.delete("/enrollments/:enrollmentId", authMiddleware, studentCtrl.cancelEnrollment);

module.exports = router;