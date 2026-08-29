const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  distributorPhone: { type: String, required: true },
  distributorName: { type: String, default: 'Unknown' },
  items: [{ product: String, quantity: Number }],
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered'], default: 'pending' },
  totalAmount: { type: Number, default: 0 },
  channel: { type: String, default: 'USSD' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
