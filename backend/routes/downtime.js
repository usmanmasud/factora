const router = require('express').Router();
const { getDowntime, logDowntime, resolveDowntime } = require('../controllers/downtimeController');

router.get('/', getDowntime);
router.post('/', logDowntime);
router.patch('/:id/resolve', resolveDowntime);

module.exports = router;
