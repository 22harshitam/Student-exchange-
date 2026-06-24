console.log("Server file loaded...");

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

// ================== INIT ==================
const app = express();
const server = http.createServer(app);

// ================== CONNECT DATABASE ==================
connectDB();

// ================== MIDDLEWARE ==================
app.use(express.json());

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ SERVE UPLOADS FOLDER
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


// ================== ROUTES ==================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/library", require("./routes/library"));
app.use("/api/cohorts", require("./routes/cohorts"));
app.use("/api/users", require("./routes/users"));
app.use("/api/upload", require("./routes/upload"));


// ================== TEST ROUTE ==================
app.get("/", (req, res) => {
  res.send("Backend running ✔");
});

// ================== SOCKET.IO ==================
const io = require("socket.io")(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

// ================== SOCKET LOGIC ==================
const Message = require("./models/Message");
const User = require("./models/User");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (cohortId) => {
    socket.join(cohortId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const message = await Message.create({
        cohortId: data.cohortId,
        userId: data.userId,
        userName: data.userName,
        messageType: data.messageType || "text",
        text: data.text || "",
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        linkUrl: data.linkUrl || null,
        rating: 0,
        ratedBy: []
      });

      io.to(data.cohortId).emit("receiveMessage", message);
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);
    }
  });

  socket.on("rateMessage", async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;
      if (message.userId.toString() === userId) return;
      if (message.ratedBy.includes(userId)) return;

      message.rating += 1;
      message.ratedBy.push(userId);
      await message.save();

      await User.findByIdAndUpdate(message.userId, {
        $inc: { uniPoints: 1 }
      });

      io.to(message.cohortId.toString()).emit("messageRated", {
        messageId,
        rating: message.rating
      });
    } catch (err) {
      console.error("RATE ERROR:", err);
    }
  });

  socket.on("deleteMessage", async ({ messageId, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return;
      if (message.userId.toString() !== userId) return;

      await Message.findByIdAndDelete(messageId);
      io.to(message.cohortId.toString()).emit("messageDeleted", messageId);
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
