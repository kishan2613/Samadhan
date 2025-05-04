// models/Suggestion.js
const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  fromParty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toPartyEmail: { type: String, required: true },
  mediator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['accepted by opponent','pending', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Suggestion', suggestionSchema);