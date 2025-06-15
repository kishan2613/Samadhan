const express = require('express');
const Proposal = require('../Models/Proposal');
const ChatRoom = require('../Models/Chatroom');
const auth = require('../Middleware/Auth');
const router = express.Router();

// POST /api/mediator/:id/decision
router.post('/:id/decision', auth, async (req, res) => {
  const { action } = req.body; // 'accept'|'reject'
  try {
    const proposal = await Proposal.findById(req.params.id).populate('suggestion');
    if (!proposal) return res.status(404).json({ msg: 'Not found' });
    if (req.user.role !== 'mediator' || req.user.id !== proposal.suggestion.mediator.toString())
      return res.status(403).json({ msg: 'Not authorized' });

    if (action === 'reject') {
      proposal.mediatorDecision = 'rejected';
      await proposal.save();
      return res.json({ msg: 'Proposal rejected' });
    }

    proposal.mediatorDecision = 'accepted';
    await proposal.save();

    // create chat room
    const chat = new ChatRoom({
      members: [...proposal.acceptedBy, proposal.suggestion.mediator],
      proposal: proposal.id,
    });
    await chat.save();

    res.json({ proposal, chatRoom: chat });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;