const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'units' },
  reorderLevel: { type: Number, default: 50 },
  alertSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
