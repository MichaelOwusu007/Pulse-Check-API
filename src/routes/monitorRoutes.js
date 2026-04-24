const express = require('express');
const router = express.Router();

const {
  createMonitor,
  heartbeat,
  pauseMonitor,
  getMonitor
} = require('../controllers/monitorController');

router.post('/', createMonitor);
router.post('/:id/heartbeat', heartbeat);
router.post('/:id/pause', pauseMonitor);
router.get('/:id', getMonitor);

module.exports = router;