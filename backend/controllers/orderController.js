const Order = require('../models/Order');
const { sms } = require('../config/at');

exports.getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

  // Notify distributor via SMS
  await sms.send({
    to: [order.distributorPhone],
    message: `[FACTORA] Your order ${order._id.toString().slice(-6).toUpperCase()} status: ${status.toUpperCase()}. Thank you!`,
    from: process.env.AT_SENDER_ID,
  });

  res.json(order);
};

exports.deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
