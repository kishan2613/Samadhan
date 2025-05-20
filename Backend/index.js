const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev; tighten this for production
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join specific room
  socket.on("speech", ({ roomId, text, language, gender, from }) => {
    console.log(
      `Room: ${roomId} | User: ${from} | Lang: ${language} | Gender: ${gender} | Text: ${text}`
    );
    socket.to(roomId).emit("speech-message", { from, text });
  });

  // Let client join a room
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`User ${socket.id} (${username}) joined room ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
