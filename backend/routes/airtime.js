const router = require('express').Router();
const { sendAirtime, getAirtimeLogs } = require('../controllers/airtimeController');

router.post('/send', sendAirtime);
router.get('/logs', getAirtimeLogs);

module.exports = router;
