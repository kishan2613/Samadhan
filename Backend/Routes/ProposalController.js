const express = require('express');
const Proposal = require('../Models/Proposal');
const auth = require('../Middleware/Auth');
const router = express.Router();
const ChatRoom = require('../Models/Chatroom');

// POST /api/proposals/:id/summary
router.post('/:id/summary', async (req, res) => {
  const { summaryText,userId } = req.body;
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ msg: 'Not found' });
    if (!proposal.acceptedBy.includes(userId))
      return res.status(403).json({ msg: 'Not authorized' });

    proposal.summaryBy = userId;
    proposal.summaryText = summaryText;
    await proposal.save();
    // TODO: notify mediator
    res.json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST route to get proposals by mediator _id
router.post('/by-mediator', async (req, res) => {
  const { mediatorId } = req.body;

  if (!mediatorId) {
    return res.status(400).json({ error: 'mediatorId is required in body' });
  }

  try {
    const proposals = await Proposal.find()
      .populate({
        path: 'suggestion',
        match: { mediator: mediatorId },
      })
      .populate('acceptedBy')
      .populate('summaryBy');

    // Filter out proposals where suggestion is null due to mismatch
    const filteredProposals = proposals.filter(p => p.suggestion !== null);

    res.json(filteredProposals);
  } catch (err) {
    console.error('Error fetching proposals:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/proposals/accept
router.post('/accept', async (req, res) => {
  const { proposalId, mediatorId } = req.body;

  try {
    // 1. Find the proposal
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ msg: 'Proposal not found' });

    // 2. Check if already accepted
    if (proposal.mediatorDecision === 'accepted') {
      return res.status(400).json({ msg: 'Proposal already accepted' });
    }

    // 3. Update mediator decision
    proposal.mediatorDecision = 'accepted';
    await proposal.save();

    // 4. Create chat room with acceptedBy users and mediator
    const memberIds = [...proposal.acceptedBy.map(id => id.toString()), mediatorId];

    const chatRoom = new ChatRoom({
      members: memberIds,
      proposal: proposal._id
    });

    await chatRoom.save();

    res.status(201).json({
      msg: 'Proposal accepted and chat room created successfully',
      chatRoomId: chatRoom._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;