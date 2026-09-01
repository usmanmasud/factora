const { sms } = require('../config/at');
const Alert = require('../models/Alert');
const Worker = require('../models/Worker');
const Inventory = require('../models/Inventory');

// Send SMS alert to workers
exports.sendAlert = async (req, res) => {
  const { type, message, recipientPhones } = req.body;

  let phones = recipientPhones;
  if (!phones || phones.length === 0) {
    const workers = await Worker.find({ active: true });
    phones = workers.map((w) => w.phone);
  }

  if (phones.length === 0) return res.status(400).json({ error: 'No recipients found' });

  let result;
  try {
    result = await sms.send({
      to: phones,
      message: `[FACTORA] ${message}`,
      from: process.env.AT_SENDER_ID,
    });
    console.log('AT SMS result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('AT SMS error:', err.message);
    return res.status(500).json({ error: err.message });
  }

  const alert = await Alert.create({
    type,
    message,
    recipients: phones,
    status: 'sent',
    atMessageId: result.SMSMessageData?.Recipients?.[0]?.messageId || '',
  });

  res.json({ success: true, alert, atResult: result.SMSMessageData });
};

// Auto restock alert when inventory is low
exports.checkAndAlertLowStock = async () => {
  const lowItems = await Inventory.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] }, alertSent: false });
  if (lowItems.length === 0) return;

  const workers = await Worker.find({ active: true, role: { $in: ['supervisor', 'manager'] } });
  const phones = workers.map((w) => w.phone);
  if (phones.length === 0) return;

  for (const item of lowItems) {
    const msg = `LOW STOCK ALERT: ${item.product} is at ${item.quantity} ${item.unit}. Reorder level: ${item.reorderLevel}.`;
    await sms.send({ to: phones, message: `[FACTORA] ${msg}`, from: process.env.AT_SENDER_ID });
    await Inventory.findByIdAndUpdate(item._id, { alertSent: true });
    await Alert.create({ type: 'restock', message: msg, recipients: phones, status: 'sent' });
  }
};

exports.getAlerts = async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
  res.json(alerts);
};
