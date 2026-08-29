const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['downtime', 'restock', 'task', 'general'], required: true },
  message: { type: String, required: true },
  recipients: [String],
  status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
  atMessageId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
