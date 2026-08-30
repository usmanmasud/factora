const Downtime = require('../models/Downtime');
const { sms } = require('../config/at');
const Worker = require('../models/Worker');

exports.getDowntime = async (req, res) => {
  const logs = await Downtime.find().sort({ createdAt: -1 }).limit(50);
  res.json(logs);
};

exports.logDowntime = async (req, res) => {
  const { machine, reason, reportedBy } = req.body;
  const log = await Downtime.create({ machine, reason, reportedBy });

  // Alert supervisors/managers via SMS
  const supervisors = await Worker.find({ active: true, role: { $in: ['supervisor', 'manager'] } });
  const phones = supervisors.map((w) => w.phone);
  if (phones.length > 0) {
    await sms.send({
      to: phones,
      message: `[FACTORA] DOWNTIME ALERT: ${machine} is down. Reason: ${reason}. Reported by: ${reportedBy || 'USSD'}`,
      from: process.env.AT_SENDER_ID,
    });
  }

  res.status(201).json(log);
};

exports.resolveDowntime = async (req, res) => {
  const log = await Downtime.findByIdAndUpdate(
    req.params.id,
    { status: 'resolved', resolvedAt: new Date() },
    { new: true }
  );
  res.json(log);
};
