const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const router = express.Router();
const auth = require('../Middleware/Auth');
const Mediator = require('../Models/Mediator');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hash, role });
    await user.save();

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token,user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/update-mediator', auth, async (req, res) => {
  if (req.user.role !== 'mediator') {
    return res.status(403).json({ msg: 'Only mediators can create or update their profile' });
  }
  try {
    const {
      image = '',
      location = '',
      chronicles = '',
      qualification = '',
      languagesKnown = '',
      otherInterests = '',
      areasOfExpertise = '',
      lastHeldPosition = '',
      yearsOfExperience = '',
      affiliatedOrganisation = '',
    } = req.body;

    // Use the base User model to get the document
    let user = await User.findById(req.user._id);

    if (!user || user.role !== 'mediator') {
      return res.status(404).json({ msg: 'Mediator profile not found. Please contact admin.' });
    }

    const profileData = {
      image,
      location,
      chronicles,
      qualification,
      languagesKnown,
      otherInterests,
      areasOfExpertise,
      lastHeldPosition,
      yearsOfExperience,
      affiliatedOrganisation,
    };

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: profileData },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/get-mediators', async (req, res) => {
  try {
    const mediators = await User.find({ role: 'mediator' }).select('-password');
    res.json(mediators);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to get mediator details by user ID
router.post('/get-mediator-by-id', async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== 'mediator') {
      return res.status(403).json({ success: false, message: "User is not a mediator" });
    }

    return res.status(200).json({ success: true, mediator: user });
  } catch (error) {
    console.error("Error fetching mediator:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;