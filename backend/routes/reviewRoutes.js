const express        = require("express");
const router         = express.Router();
const reviewCtrl     = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

// specific string routes BEFORE /:tutorId wildcard
router.get("/homepage",         reviewCtrl.getHomepageReviews);
router.get("/mine",             authMiddleware, reviewCtrl.getMyReviews);
router.post("/",                authMiddleware, reviewCtrl.createReview);
router.get("/tutor/:tutorId",   reviewCtrl.getTutorReviews);

module.exports = router;