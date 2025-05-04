const mongoose = require('mongoose');
const User = require('./User');

const partySchema = new mongoose.Schema({
  // Add party-specific fields if needed
});

module.exports = User.discriminator('party', partySchema);