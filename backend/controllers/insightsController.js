const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Alert = require('../models/Alert');
const AirtimeLog = require('../models/AirtimeLog');
const Worker = require('../models/Worker');

exports.getInsights = async (req, res) => {
  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalAlerts,
    totalAirtime,
    lowStockItems,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'delivered' }),
    Alert.countDocuments(),
    AirtimeLog.aggregate([{ $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }]),
    Inventory.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({
    summary: {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalAlerts,
      totalAirtimeSent: totalAirtime[0]?.total || 0,
      lowStockCount: lowStockItems.length,
    },
    lowStockItems,
    recentOrders,
    ordersByStatus,
  });
};
