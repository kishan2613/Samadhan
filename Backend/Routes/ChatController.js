const express = require('express');
const ChatRoom = require('../Models/Chatroom');
const auth = require('../Middleware/Auth');
const router = express.Router();

// 1. Fetch all chat rooms of a particular user
router.post('/myRooms', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const rooms = await ChatRoom.find({ members: userId }) // exact string match
      .populate('members')
      .populate('proposal');

    res.json(rooms);
  } catch (err) {
    console.error('Error fetching chat rooms:', err);
    res.status(500).send('Server error');
  }
});

// 2. Get full chat history of a room (including messages)
router.post('/:roomId', async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await ChatRoom.findById(req.params.roomId)
      .populate('members', 'name email')
      .populate('messages.sender', 'name email');

    if (!chat) return res.status(404).json({ msg: 'Chat room not found' });

    // Only allow access if user is part of the room
    if (!chat.members.some(member => member._id.toString() === userId)) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// POST /:roomId/message
router.post('/:roomId/message', async (req, res) => {
  const { content, userId } = req.body;
  const { roomId } = req.params;
  const io = req.app.get('io');            // grab io

  try {
    const chat = await ChatRoom.findById(roomId);
    if (!chat) return res.status(404).json({ msg: 'Chat room not found' });
    if (!chat.members.includes(userId))
      return res.status(403).json({ msg: 'Access denied' });

    const newMessage = {
      sender: userId,
      content,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Broadcast it:
    io.to(roomId).emit('receiveMessage', {
      _id: newMessage._id,
      sender: { _id: userId },  // optionally populate on client
      content: newMessage.content,
      timestamp: newMessage.timestamp
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// 4. (Optional) Create a new chat room
router.post('/create', auth, async (req, res) => {
  const { members, proposalId } = req.body;

  if (!members.includes(req.user.id)) {
    members.push(req.user.id); // Ensure the creator is included
  }

  try {
    const newRoom = new ChatRoom({
      members,
      proposal: proposalId
    });

    await newRoom.save();

    res.status(201).json(newRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
