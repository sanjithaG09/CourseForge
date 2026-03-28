const jwt = require("jsonwebtoken");   // 🔥 YOU MISSED THIS
const blacklist = require("./blacklist");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  // 🔥 check blacklist (logout support)
  if (blacklist.includes(token)) {
    return res.status(401).json({ message: "Token expired (logged out)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};