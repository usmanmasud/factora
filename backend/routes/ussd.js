const router = require('express').Router();
const { handleUSSD } = require('../controllers/ussdController');

router.post('/callback', handleUSSD);

module.exports = router;
