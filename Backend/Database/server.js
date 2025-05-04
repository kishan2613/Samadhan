const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('../Routes/Usercontroller'));
app.use('/api/suggestions', require('../Routes/SuggestionController'));
app.use('/api/proposals', require('../Routes/ProposalController'));
app.use('/api/mediator', require('../Routes/MediatorController'));
app.use('/api/chat', require('../Routes/ChatController'));

// Create HTTP server for Socket.IO to hook into
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', async ({ roomId, senderId, content }) => {
    try {
      const ChatRoom = require('./models/ChatRoom');
      const chatRoom = await ChatRoom.findById(roomId);
      if (!chatRoom) return;

      const newMessage = {
        sender: senderId,
        content,
        timestamp: new Date()
      };

      chatRoom.messages.push(newMessage);
      await chatRoom.save();

      io.to(roomId).emit('receiveMessage', newMessage);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start both HTTP and WebSocket server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
