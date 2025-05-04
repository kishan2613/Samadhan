const mongoose = require('mongoose');
const User = require('./User');

const mediatorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  image: { type: String, required: true },
  location: { type: String, required: true },
  chronicles: { type: String },
  qualification: { type: String },
  languagesKnown: { type: String },
  otherInterests: { type: String },
  areasOfExpertise: { type: String },
  lastHeldPosition: { type: String },
  yearsOfExperience: { type: Number },
  affiliatedOrganisation: { type: String },
});

module.exports = User.discriminator('mediator', mediatorSchema);