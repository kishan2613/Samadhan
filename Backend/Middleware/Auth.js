const jwt = require('jsonwebtoken');
const User = require('../Models/User');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id, role: decoded.role };

    // Optionally ensure user still exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};