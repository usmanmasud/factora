const router = require('express').Router();
const { sendAlert, getAlerts } = require('../controllers/smsController');

router.post('/send', sendAlert);
router.get('/', getAlerts);

module.exports = router;
