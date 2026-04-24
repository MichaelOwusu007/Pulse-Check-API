const monitors = new Map();

const STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DOWN: 'down'
};

const toTimeoutMs = (timeoutSeconds) => timeoutSeconds * 1000;

const getTimeRemainingSeconds = (monitor) => {
  if (monitor.status !== STATUS.ACTIVE || !monitor.expiresAt) {
    return null;
  }

  return Math.max(0, Math.ceil((monitor.expiresAt - Date.now()) / 1000));
};

const serializeMonitor = (monitor) => ({
  id: monitor.id,
  alert_email: monitor.alertEmail,
  timeout: monitor.timeoutSeconds,
  status: monitor.status,
  created_at: monitor.createdAt,
  last_heartbeat_at: monitor.lastHeartbeatAt,
  paused_at: monitor.pausedAt,
  down_at: monitor.downAt,
  time_remaining: getTimeRemainingSeconds(monitor)
});

const clearMonitorTimer = (monitor) => {
  if (monitor.timer) {
    clearTimeout(monitor.timer);
    monitor.timer = null;
  }
};

const fireAlert = (monitor) => {
  const payload = {
    ALERT: `Device ${monitor.id} is down!`,
    time: new Date().toISOString()
  };

  console.log(JSON.stringify(payload));
};

const startTimer = (monitor) => {
  clearMonitorTimer(monitor);

  monitor.expiresAt = Date.now() + toTimeoutMs(monitor.timeoutSeconds);
  monitor.timer = setTimeout(() => {
    if (monitor.status !== STATUS.ACTIVE) {
      return;
    }

    monitor.status = STATUS.DOWN;
    monitor.timer = null;
    monitor.expiresAt = Date.now();
    monitor.downAt = new Date().toISOString();

    fireAlert(monitor);
  }, toTimeoutMs(monitor.timeoutSeconds));
};

const validateMonitorInput = ({ id, timeout, alert_email }) => {
  if (!id || typeof id !== 'string' || !id.trim()) {
    return 'A non-empty string id is required.';
  }

  if (!Number.isInteger(timeout) || timeout <= 0) {
    return 'timeout must be a positive integer in seconds.';
  }

  if (!alert_email || typeof alert_email !== 'string' || !alert_email.trim()) {
    return 'alert_email is required.';
  }

  return null;
};

exports.createMonitor = ({ id, timeout, alert_email }) => {
  const validationError = validateMonitorInput({ id, timeout, alert_email });

  if (validationError) {
    return {
      status: 400,
      data: { message: validationError }
    };
  }

  if (monitors.has(id)) {
    return {
      status: 409,
      data: { message: `Monitor ${id} already exists.` }
    };
  }

  const now = new Date().toISOString();
  const monitor = {
    id,
    alertEmail: alert_email,
    timeoutSeconds: timeout,
    status: STATUS.ACTIVE,
    timer: null,
    expiresAt: null,
    createdAt: now,
    lastHeartbeatAt: now,
    pausedAt: null,
    downAt: null
  };

  startTimer(monitor);
  monitors.set(id, monitor);

  return {
    status: 201,
    data: {
      message: `Monitor ${id} created successfully.`,
      monitor: serializeMonitor(monitor)
    }
  };
};

exports.heartbeat = (id) => {
  const monitor = monitors.get(id);

  if (!monitor) {
    return { status: 404, data: { message: 'Monitor not found.' } };
  }

  if (monitor.status === STATUS.DOWN) {
    return {
      status: 409,
      data: {
        message: `Monitor ${id} is already down and cannot be reset by heartbeat.`,
        monitor: serializeMonitor(monitor)
      }
    };
  }

  monitor.status = STATUS.ACTIVE;
  monitor.lastHeartbeatAt = new Date().toISOString();
  monitor.pausedAt = null;
  monitor.downAt = null;

  startTimer(monitor);

  return {
    status: 200,
    data: {
      message: `Heartbeat received for ${id}. Timer reset to ${monitor.timeoutSeconds} seconds.`,
      monitor: serializeMonitor(monitor)
    }
  };
};

exports.pause = (id) => {
  const monitor = monitors.get(id);

  if (!monitor) {
    return { status: 404, data: { message: 'Monitor not found.' } };
  }

  if (monitor.status === STATUS.DOWN) {
    return {
      status: 409,
      data: {
        message: `Monitor ${id} is already down and cannot be paused.`,
        monitor: serializeMonitor(monitor)
      }
    };
  }

  clearMonitorTimer(monitor);
  monitor.status = STATUS.PAUSED;
  monitor.expiresAt = null;
  monitor.pausedAt = new Date().toISOString();

  return {
    status: 200,
    data: {
      message: `Monitoring paused for ${id}.`,
      monitor: serializeMonitor(monitor)
    }
  };
};

exports.getMonitor = (id) => {
  const monitor = monitors.get(id);

  if (!monitor) {
    return { status: 404, data: { message: 'Monitor not found.' } };
  }

  return {
    status: 200,
    data: {
      monitor: serializeMonitor(monitor)
    }
  };
};
