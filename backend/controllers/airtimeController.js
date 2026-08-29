const { airtime } = require('../config/at');
const AirtimeLog = require('../models/AirtimeLog');
const Worker = require('../models/Worker');

exports.sendAirtime = async (req, res) => {
  const { distributorPhone, amount, currency = 'KES', reason } = req.body;

  const result = await airtime.send({
    recipients: [{ phoneNumber: distributorPhone, amount: `${currency} ${amount}` }],
  });

  const worker = await Worker.findOne({ phone: distributorPhone });

  const log = await AirtimeLog.create({
    distributorPhone,
    distributorName: worker?.name || 'Unknown',
    amount,
    currency,
    reason: reason || 'Sales report reward',
    status: result.responses?.[0]?.status === 'Success' ? 'sent' : 'failed',
    atResponse: result,
  });

  res.json({ success: true, log, atResult: result });
};

exports.getAirtimeLogs = async (req, res) => {
  const logs = await AirtimeLog.find().sort({ createdAt: -1 }).limit(50);
  res.json(logs);
};
