const { voice } = require('../config/at');
const Worker = require('../models/Worker');

exports.callWorker = async (req, res) => {
  const { workerId, message } = req.body;

  const worker = await Worker.findById(workerId);
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  const result = await voice.call({
    callFrom: process.env.AT_CALLER_ID,
    callTo: worker.phone,
  });

  res.json({ success: true, worker: worker.name, phone: worker.phone, atResult: result });
};

// Callback AT hits when call is answered — respond with TTS message
exports.voiceCallback = (req, res) => {
  const { message } = req.query;
  const text = message || 'Hello, you have a new task assigned from Factora. Please check your SMS for details.';
  res.set('Content-Type', 'text/plain');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>${text}</Say></Response>`);
};
