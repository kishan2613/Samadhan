// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['party', 'mediator'], default: 'party' },
  createdAt: { type: Date, default: Date.now },
  signature: { type: String, default: '' },
  // Add the optional mediator profile fields
  image: { type: String, default: '' },
  location: { type: String, default: '' },
  chronicles: { type: String, default: '' },
  qualification: { type: String, default: '' },
  languagesKnown: { type: String, default: '' },
  otherInterests: { type: String, default: '' },
  areasOfExpertise: { type: String, default: '' },
  lastHeldPosition: { type: String, default: '' },
  yearsOfExperience: { type: Number, default: 0 },
  affiliatedOrganisation: { type: String, default: '' },
});

module.exports = mongoose.model('User', userSchema);
