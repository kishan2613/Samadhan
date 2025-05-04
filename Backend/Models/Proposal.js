// models/Proposal.js
const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  suggestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Suggestion', required: true },
  acceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // parties who accepted
  summaryBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  summaryText: { type: String },
  mediatorDecision: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Proposal', proposalSchema);