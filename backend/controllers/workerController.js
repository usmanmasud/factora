const Worker = require('../models/Worker');

exports.getWorkers = async (req, res) => {
  const workers = await Worker.find().sort({ name: 1 });
  res.json(workers);
};

exports.createWorker = async (req, res) => {
  const worker = await Worker.create(req.body);
  res.status(201).json(worker);
};

exports.updateWorker = async (req, res) => {
  const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(worker);
};

exports.deleteWorker = async (req, res) => {
  await Worker.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
