const router = require('express').Router();
const { getWorkers, createWorker, updateWorker, deleteWorker } = require('../controllers/workerController');

router.get('/', getWorkers);
router.post('/', createWorker);
router.patch('/:id', updateWorker);
router.delete('/:id', deleteWorker);

module.exports = router;
