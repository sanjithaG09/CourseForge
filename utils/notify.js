let _io;

const init = (io) => {
  _io = io;
};

const sendNotification = (userId, message) => {
  if (!_io) return;
  _io.to(userId).emit("notification", { message, time: new Date() });
};

const broadcast = (event, data) => {
  if (!_io) return;
  _io.emit(event, data);
};

module.exports = { init, sendNotification, broadcast };
