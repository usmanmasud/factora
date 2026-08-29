const router = require('express').Router();
const { getOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');

router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

module.exports = router;
