const router = require('express').Router();
const { getInventory, upsertItem, updateQuantity, deleteItem } = require('../controllers/inventoryController');

router.get('/', getInventory);
router.post('/', upsertItem);
router.patch('/:id', updateQuantity);
router.delete('/:id', deleteItem);

module.exports = router;
