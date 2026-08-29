const mongoose = require('mongoose');

const airtimeLogSchema = new mongoose.Schema({
  distributorPhone: { type: String, required: true },
  distributorName: { type: String },
  amount: { type: String, required: true },
  currency: { type: String, default: 'KES' },
  reason: { type: String, default: 'Sales report reward' },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  atResponse: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('AirtimeLog', airtimeLogSchema);
