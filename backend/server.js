const express   = require("express");
const http      = require("http");
const { Server } = require("socket.io");
const mongoose  = require("mongoose");
const cors      = require("cors");
require("dotenv").config();

// ── Route imports ─────────────────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const tutorRoutes   = require("./routes/tutorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const reviewRoutes  = require("./routes/reviewRoutes");
const messageRoutes = require("./routes/messageRoutes");   // ← NEW Step 12

// ── Model + helper imports for socket handler ─────────────
const Message              = require("./models/Message");
const { buildRoomId }      = require("./controllers/messageController");
const Student              = require("./models/Student");
const Tutor                = require("./models/Tutor");
const jwt                  = require("jsonwebtoken");

// ── App + HTTP server setup ───────────────────────────────
// IMPORTANT: Socket.io attaches to the raw http.Server, not to Express.
// Express is still the request handler — nothing changes for REST routes.
const app        = express();
const httpServer = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "*",              // tighten to your domain in production
    methods: ["GET", "POST"],
  },
});

// ── Express middleware ────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MongoDB connection ────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err));

// ── Health check ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "API Running" });
});

// ── REST Routes ───────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/tutors",   tutorRoutes);
app.use("/api/student",  studentRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/messages", messageRoutes);   // ← NEW Step 12


// ════════════════════════════════════════════════════════════
// SOCKET.IO — Real-time messaging
//
// Auth flow:
//   Client connects with  { auth: { token: "<JWT>" } }
//   Server verifies the token and attaches req.user = { id, role }
//   to the socket before any events are handled.
//
// Room naming:
//   A "room" is a private channel between two users.
//   roomId = sorted([userA_id, userB_id]).join("_")
//   Both sides join the same room so messages are delivered to both.
//
// Events (client → server):
//   join_room   { roomId }                    – join a private room
//   send_message { receiverId, receiverRole, text } – send a message
//   mark_read   { roomId }                    – mark messages as read
//
// Events (server → client):
//   receive_message  <Message document>       – new message in room
//   messages_read    { roomId }               – peer has read messages
//   error            { message }              – something went wrong
// ════════════════════════════════════════════════════════════

// ── Socket auth middleware ────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication token required."));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;  // { id, role, iat, exp }
    next();
  } catch (err) {
    next(new Error("Invalid or expired token."));
  }
});

// ── Connection handler ────────────────────────────────────
io.on("connection", (socket) => {
  const { id: userId, role: userRole } = socket.user;
  console.log(`🔌 Socket connected: ${userId} (${userRole})`);

  // ── join_room ──────────────────────────────────────────
  // Client calls this when they open a conversation.
  // They pass the roomId they computed client-side.
  socket.on("join_room", ({ roomId }) => {
    if (!roomId || typeof roomId !== "string") return;
    socket.join(roomId);
    console.log(`   → ${userId} joined room ${roomId}`);
  });

  // ── send_message ───────────────────────────────────────
  // Client sends: { receiverId, receiverRole, text }
  // Server:
  //   1. Validates input
  //   2. Resolves sender name from DB
  //   3. Persists message to MongoDB
  //   4. Emits "receive_message" to everyone in the room (incl. sender)
  socket.on("send_message", async ({ receiverId, receiverRole, text }) => {
    try {
      if (!receiverId || !receiverRole || !text?.trim()) {
        socket.emit("error", { message: "receiverId, receiverRole and text are required." });
        return;
      }

      // Resolve sender name
      const SenderModel = userRole === "tutor" ? Tutor : Student;
      const sender      = await SenderModel.findById(userId).select("name").lean();
      if (!sender) {
        socket.emit("error", { message: "Sender not found." });
        return;
      }

      const roomId = buildRoomId(userId, receiverId);

      // Persist to DB
      const message = await Message.create({
        roomId,
        senderId:     userId,
        senderRole:   userRole,
        senderName:   sender.name,
        receiverId,
        receiverRole,
        text: text.trim(),
      });

      // Broadcast to the room (sender's socket is already in it)
      io.to(roomId).emit("receive_message", message);

    } catch (err) {
      console.error("send_message socket error:", err);
      socket.emit("error", { message: "Could not send message. Please try again." });
    }
  });

  // ── mark_read ──────────────────────────────────────────
  // When the user opens a conversation, mark all unread messages as read.
  socket.on("mark_read", async ({ roomId }) => {
    try {
      await Message.updateMany(
        {
          roomId,
          receiverId: mongoose.Types.ObjectId.createFromHexString(userId),
          readAt: null,
        },
        { $set: { readAt: new Date() } }
      );
      // Notify the other side that their messages were read
      socket.to(roomId).emit("messages_read", { roomId });
    } catch (err) {
      console.error("mark_read error:", err);
    }
  });

  // ── disconnect ─────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${userId}`);
  });
});


// ── Start server ──────────────────────────────────────────
// Use httpServer.listen (not app.listen) so Socket.io shares the port.
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server + Socket.io running on port ${PORT}`);
});