const express = require('express');
const Suggestion = require('../Models/Suggestion');
const User = require('../Models/User');
const auth = require('../Middleware/Auth');
const router = express.Router();

// POST /api/suggestions
router.post('/', async (req, res) => {
  const { fromParty,mediatorId, toPartyEmail } = req.body;
  try {
    const mediator = await User.findById(mediatorId);
    if (!mediator || mediator.role !== 'mediator')
      return res.status(400).json({ msg: 'Invalid mediator' });

    const suggestion = new Suggestion({
      fromParty,
      toPartyEmail,
      mediator: mediatorId,
    });
    await suggestion.save();
    // TODO: send notification to toPartyEmail
    res.json(suggestion);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /api/suggestions/respond
router.post('/respond', async (req, res) => {
  const { suggestionId, action, userId} = req.body; // action = 'accept'|'decline'
  try {
    const suggestion = await Suggestion.findById(suggestionId);
    if (!suggestion) return res.status(404).json({ msg: 'Not found' });

    if (action === 'decline') {
      suggestion.status = 'declined';
      await suggestion.save();
      return res.json({ msg: 'Suggestion declined' });
    }
    suggestion.status = 'accepted by opponent';
    await suggestion.save();

    // accept
    // create proposal
    const Proposal = require('../Models/Proposal');
    const proposal = new Proposal({ suggestion: suggestion.id, acceptedBy: [suggestion.fromParty,userId] });
    await proposal.save();
    res.json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route 2: Get all suggestions received by a user (via email)
router.post('/received', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Only fetch suggestions that are 'pending'
    const suggestions = await Suggestion.find({ 
      toPartyEmail: email,
      status: 'pending'
    })
    .populate('fromParty')   // include full user info
    .populate('mediator');   // include full mediator info

    return res.status(200).json({ suggestions });
    
  } catch (error) {
    console.error('Error fetching received suggestions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;