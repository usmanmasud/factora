const router = require('express').Router();
const { getInsights } = require('../controllers/insightsController');

router.get('/', getInsights);

module.exports = router;
