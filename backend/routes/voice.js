const router = require('express').Router();
const { callWorker, voiceCallback } = require('../controllers/voiceController');

router.post('/call', callWorker);
router.post('/callback', voiceCallback);
router.get('/callback', voiceCallback);

module.exports = router;
