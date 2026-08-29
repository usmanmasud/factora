const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['technician', 'supervisor', 'distributor', 'manager'], default: 'technician' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
