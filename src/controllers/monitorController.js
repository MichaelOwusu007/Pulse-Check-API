const monitorService = require('../services/monitorService');

exports.createMonitor = (req, res) => {
  const result = monitorService.createMonitor(req.body);
  res.status(result.status).json(result.data);
};

exports.heartbeat = (req, res) => {
  const result = monitorService.heartbeat(req.params.id);
  res.status(result.status).json(result.data);
};

exports.pauseMonitor = (req, res) => {
  const result = monitorService.pause(req.params.id);
  res.status(result.status).json(result.data);
};

exports.getMonitor = (req, res) => {
  const result = monitorService.getMonitor(req.params.id);
  res.status(result.status).json(result.data);
};