const Message = require("../models/Message");
const Student = require("../models/Student");
const Tutor   = require("../models/Tutor");

// ── helpers ───────────────────────────────────────────────
// Build a deterministic room ID from two user IDs so
// "A↔B" and "B↔A" always produce the same string.
function buildRoomId(idA, idB) {
  return [String(idA), String(idB)].sort().join("_");
}

// Fetch the display name of a peer, given their id and role.
async function peerName(peerId, peerRole) {
  try {
    const Model = peerRole === "tutor" ? Tutor : Student;
    const doc   = await Model.findById(peerId).select("name").lean();
    return doc?.name || "Unknown";
  } catch {
    return "Unknown";
  }
}


// ════════════════════════════════════════════════════════════
// GET /api/messages/conversations
//
// Returns a summary list of every conversation the logged-in
// user has participated in, ordered by most-recent message.
//
// Response shape (array):
//   [{
//     roomId, peerId, peerRole, peerName,
//     lastMsg, lastTime, unreadCount
//   }]
// ════════════════════════════════════════════════════════════
exports.getConversations = async (req, res) => {
  try {
    const userId   = req.user.id;
    const userRole = req.user.role;

    // Find all rooms this user appears in
    const rooms = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: { $eq: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
            { receiverId: { $eq: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
          ],
        },
      },
      // Sort newest first before grouping
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id:         "$roomId",
          lastMsg:     { $first: "$text" },
          lastTime:    { $first: "$createdAt" },
          senderId:    { $first: "$senderId" },
          receiverId:  { $first: "$receiverId" },
          senderRole:  { $first: "$senderRole" },
          receiverRole:{ $first: "$receiverRole" },
          unread: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [{ $toString: "$receiverId" }, userId] },
                    { $eq: ["$readAt", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastTime: -1 } },
    ]);

    // Resolve peer names (runs in parallel)
    const conversations = await Promise.all(
      rooms.map(async (r) => {
        const isSender = String(r.senderId) === userId;
        const peerId   = isSender ? r.receiverId : r.senderId;
        const peerRole = isSender ? r.receiverRole : r.senderRole;
        const name     = await peerName(peerId, peerRole);

        // Avatar initials + colour palette
        const initials  = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
        const PALETTE   = ["#dbeafe", "#dcfce7", "#f5f3ff", "#fef9c3", "#fee2e2"];
        const COLOR_FG  = ["#1d4ed8", "#15803d", "#6d28d9", "#92400e", "#b91c1c"];
        const idx       = (initials.charCodeAt(0) || 0) % PALETTE.length;

        return {
          id:           r._id,       // roomId doubles as conversation id
          roomId:       r._id,
          peerId:       String(peerId),
          peerRole,
          name,
          initials,
          avatarBg:     PALETTE[idx],
          avatarColor:  COLOR_FG[idx],
          lastMsg:      r.lastMsg.length > 40 ? r.lastMsg.slice(0, 40) + "…" : r.lastMsg,
          time:         new Date(r.lastTime).toLocaleTimeString("en-IN", {
                          hour: "2-digit", minute: "2-digit",
                        }),
          unreadCount:  r.unread,
        };
      })
    );

    res.json(conversations);
  } catch (err) {
    console.error("getConversations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// GET /api/messages/:roomId
//
// Returns all messages in a room, oldest first.
// Also marks all unread messages (where receiver = me) as read.
// ════════════════════════════════════════════════════════════
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId     = req.user.id;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark unread messages delivered to me as read
    await Message.updateMany(
      {
        roomId,
        receiverId: require("mongoose").Types.ObjectId.createFromHexString(userId),
        readAt: null,
      },
      { $set: { readAt: new Date() } }
    );

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ════════════════════════════════════════════════════════════
// POST /api/messages/send
//
// Persists a message to MongoDB.
// The Socket.io layer calls this internally after receiving a
// "send_message" event — it is also exposed as a REST endpoint
// so the frontend can fall back if the socket is disconnected.
//
// Body: { receiverId, receiverRole, text }
// ════════════════════════════════════════════════════════════
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverRole, text } = req.body;
    const senderId   = req.user.id;
    const senderRole = req.user.role;

    if (!receiverId || !receiverRole || !text?.trim()) {
      return res.status(400).json({ message: "receiverId, receiverRole and text are required." });
    }

    // Resolve sender name
    const SenderModel = senderRole === "tutor" ? Tutor : Student;
    const sender      = await SenderModel.findById(senderId).select("name").lean();
    if (!sender) return res.status(404).json({ message: "Sender not found." });

    const roomId = buildRoomId(senderId, receiverId);

    const message = await Message.create({
      roomId,
      senderId,
      senderRole,
      senderName: sender.name,
      receiverId,
      receiverRole,
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ── Export helper for use inside socket handler ───────────
exports.buildRoomId = buildRoomId;