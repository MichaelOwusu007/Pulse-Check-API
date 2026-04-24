const monitors = new Map();

const startTimer = (monitor) => {
  return setTimeout(() => {
    console.log({
      ALERT: `Device ${monitor.id} is down!`,
      time: new Date().toISOString()
    });

    monitor.status = "down";
  }, monitor.timeout);
};

exports.createMonitor = ({ id, timeout, alert_email }) => {
  if (!id || !timeout) {
    return { status: 400, data: { message: "Invalid input" } };
  }

  if (monitors.has(id)) {
    return { status: 400, data: { message: "Monitor exists" } };
  }

  const monitor = {
    id,
    timeout: timeout * 1000,
    alert_email,
    status: "active",
    timer: null,
    expiresAt: Date.now() + timeout * 1000
  };

  monitor.timer = startTimer(monitor);
  monitors.set(id, monitor);

  return { status: 201, data: { message: "Monitor created" } };
};


exports.heartbeat = (id) => {
  const monitor = monitors.get(id);

  if (!monitor) {
    return { status: 404, data: { message: "Not found" } };
  }


  if (monitor.status === "paused") {
    monitor.status = "active";
  }

  clearTimeout(monitor.timer);

  monitor.status = "active";
  monitor.expiresAt = Date.now() + monitor.timeout;
  monitor.timer = startTimer(monitor);

  return { status: 200, data: { message: "Heartbeat received" } };
};

// exports.heartbeat = (id) => {
//   const monitor = monitors.get(id);

//   if (!monitor) {
//     return { status: 404, data: { message: "Not found" } };
//   }

//   clearTimeout(monitor.timer);

//   monitor.status = "active";
//   monitor.expiresAt = Date.now() + monitor.timeout;
//   monitor.timer = startTimer(monitor);

//   return { status: 200, data: { message: "Heartbeat received" } };
// };

exports.pause = (id) => {
  const monitor = monitors.get(id);

  if (!monitor) {
    return { status: 404, data: { message: "Not found" } };
  }

  clearTimeout(monitor.timer);
  monitor.status = "paused";

  return { status: 200, data: { message: "Paused" } };
};

exports.getMonitor = (id) => {
  const monitor = monitors.get(id);

  if (!monitor) {
    return { status: 404, data: { message: "Not found" } };
  }

  let timeRemaining = null;

  if (monitor.status === "active") {
    timeRemaining = Math.max(
      0,
      Math.floor((monitor.expiresAt - Date.now()) / 1000)
    );
  }

  return {
    status: 200,
    data: {
      id: monitor.id,
      status: monitor.status,
      timeRemaining
    }
  };
};