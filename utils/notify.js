const sendNotification = (req, userId, message) => {
  const io = req.app.get("io");

  io.to(userId).emit("notification", {
    message,
    time: new Date()
  });
};

module.exports = sendNotification;
