const express = require("express");
const ChatRoom = require("../Models/Chatroom");
const auth = require("../Middleware/Auth");
const User = require("../Models/User");
const router = express.Router();

// 1. Fetch all chat rooms of a particular user
router.post("/myRooms", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const rooms = await ChatRoom.find({ members: userId }) // exact string match
      .populate("members")
      .populate("proposal");

    res.json(rooms);
  } catch (err) {
    console.error("Error fetching chat rooms:", err);
    res.status(500).send("Server error");
  }
});

// 2. Get full chat history of a room (including messages)
router.post("/:roomId", async (req, res) => {
  try {
    const { userId } = req.body;
    const chat = await ChatRoom.findById(req.params.roomId)
      .populate("members", "name email")
      .populate("messages.sender", "name email");

    if (!chat) return res.status(404).json({ msg: "Chat room not found" });

    // Only allow access if user is part of the room
    if (!chat.members.some((member) => member._id.toString() === userId)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 3. Post a message (HTTP) - persist then broadcast
// persist only
router.post("/:roomId/message", async (req, res) => {
  const { content, userId } = req.body;
  const chat = await ChatRoom.findById(req.params.roomId);
  chat.messages.push({ sender: userId, content, timestamp: new Date() });
  const saved = await chat.save();
  res.status(201).json(saved.messages.pop());
});

// 4. (Optional) Create a new chat room
router.post("/create", auth, async (req, res) => {
  const { members, proposalId } = req.body;

  if (!members.includes(req.user.id)) {
    members.push(req.user.id); // Ensure the creator is included
  }

  try {
    const newRoom = new ChatRoom({
      members,
      proposal: proposalId,
    });

    await newRoom.save();

    res.status(201).json(newRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/consent/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const chat = await ChatRoom.findById(roomId)
      .populate({
        path: "members",
        select:
          "name email image role qualification location affiliatedOrganisation signature",
      })
      .populate({
        path: "proposal",
        populate: {
          path: "suggestion",
          populate: [
            {
              path: "fromParty",
              select: "name email image role signature",
            },
            {
              path: "mediator",
              select:
                "name email image role qualification affiliatedOrganisation yearsOfExperience signature",
            },
          ],
        },
      })
      .populate({
        path: "messages.sender",
        select: "name email image role signature",
      });

    if (!chat) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching detailed chat room info:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/:userId/signature', async (req, res) => {
  const { userId } = req.params;
  const { signatureUrl } = req.body;

  if (!signatureUrl || typeof signatureUrl !== 'string') {
    return res.status(400).json({ error: 'Invalid signature URL.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { signature: signatureUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      message: 'Signature updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        signature: user.signature,
      },
    });
  } catch (err) {
    console.error('Error updating signature:', err);
    res.status(500).json({ error: 'Server error. Try again later.' });
  }
});

module.exports = router;
