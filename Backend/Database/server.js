const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

connectToMongo();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('../Routes/Usercontroller'));
app.use('/api/suggestions', require('../Routes/SuggestionController'));
app.use('/api/proposals', require('../Routes/ProposalController'));
app.use('/api/mediator', require('../Routes/MediatorController'));
app.use('/api/chat', require('../Routes/ChatController'));
app.use("/ask", require('../BhasiniAiRoutes/llmconn'));
app.use("/audio",require("../BhasiniAiRoutes/bhasiniconv"));
app.use("/translate",require("../BhasiniAiRoutes/Translate"))
app.use("/api/community", require("../Routes/Community"));
app.use("/api/comments", require("../Routes/Comment"));
 


// Create HTTP server for Socket.IO to hook into
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make io available in routes
app.set('io', io);

// Socket.IO logic: only broadcasting here (persistence in HTTP route)
io.on('connection', socket => {
  console.log('user connected', socket.id);

  // handle join and notify others
  socket.on('joinRoom', ({ roomId, userId, userName }) => {
    // store on socket for later
    socket.data.userId = userId;
    socket.data.userName = userName;
    socket.join(roomId);
    // notify other members
    socket.to(roomId).emit('userJoined', { userId, userName });
  });

  // message logic unchanged
  socket.on('sendMessage', async ({ roomId, senderId, content, tempId }) => {
    try {
      const ChatRoom = require('../Models/Chatroom');
      const chat = await ChatRoom.findById(roomId);
      const newMessage = { sender: senderId, content, timestamp: new Date() };
      chat.messages.push(newMessage);
      await chat.save();

      socket.broadcast.to(roomId).emit('receiveMessage', {
        _id: newMessage._id,
        sender: { _id: senderId },
        content,
        timestamp: newMessage.timestamp,
        tempId
      });
      socket.emit('messageSaved', { _id: newMessage._id, tempId });
    } catch (err) {
      console.error(err);
    }
  });

  // before fully disconnecting, notify rooms
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(roomId => {
      socket.to(roomId).emit('userLeft', {
        userId: socket.data.userId,
        userName: socket.data.userName
      });
    });
  });

  socket.on('disconnect', reason => console.log('user disconnected', socket.id, reason));
});

server.listen(port, () => console.log(`listening on ${port}`));
