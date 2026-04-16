const express    = require("express");
const router     = express.Router();
const authCtrl   = require("../controllers/authController");

router.post("/register-student", authCtrl.registerStudent);
router.post("/register-tutor",   authCtrl.registerTutor);
router.post("/login",            authCtrl.login);

module.exports = router;