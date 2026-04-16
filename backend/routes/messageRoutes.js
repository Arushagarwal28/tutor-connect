const express        = require("express");
const router         = express.Router();
const msgCtrl        = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

// All message routes require authentication
router.get( "/conversations",  authMiddleware, msgCtrl.getConversations);
router.get( "/:roomId",        authMiddleware, msgCtrl.getMessages);
router.post("/send",           authMiddleware, msgCtrl.sendMessage);

module.exports = router;