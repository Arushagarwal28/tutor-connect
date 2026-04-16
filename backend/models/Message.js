const mongoose = require("mongoose");

// ── Message Schema ─────────────────────────────────────────
// One document per chat message.
// A "conversation" is identified by a sorted pair: [senderId, receiverId]
// sorted alphabetically so the same two users always share one room key.

const MessageSchema = new mongoose.Schema(
  {
    // The Socket.io / conversation room key — always sorted so
    // "userA_userB" === "userB_userA" regardless of who initiates.
    roomId: { type: String, required: true, index: true },

    senderId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ["student", "tutor"], required: true },
    senderName: { type: String, required: true },

    receiverId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    receiverRole: { type: String, enum: ["student", "tutor"], required: true },

    text: { type: String, required: true, trim: true, maxlength: 2000 },

    // read receipt — updated when the receiver's socket joins the room
    readAt: { type: Date, default: null },
  },
  { timestamps: true }   // createdAt = message timestamp
);

// Compound index: fast "fetch all messages in a room, newest last"
MessageSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);