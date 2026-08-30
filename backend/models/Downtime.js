const mongoose = require('mongoose');

const downtimeSchema = new mongoose.Schema({
  machine: { type: String, required: true },
  reason: { type: String, required: true },
  reportedBy: { type: String }, // phone number
  resolvedAt: { type: Date },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Downtime', downtimeSchema);
