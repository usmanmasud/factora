const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  const items = await Inventory.find().sort({ product: 1 });
  res.json(items);
};

exports.upsertItem = async (req, res) => {
  const { product, quantity, unit, reorderLevel } = req.body;
  const item = await Inventory.findOneAndUpdate(
    { product },
    { quantity, unit, reorderLevel, alertSent: false },
    { upsert: true, new: true }
  );
  res.json(item);
};

exports.updateQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const item = await Inventory.findByIdAndUpdate(id, { quantity, alertSent: false }, { new: true });
  res.json(item);
};

exports.deleteItem = async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
