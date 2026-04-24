const jwt = require("jsonwebtoken");
const redis = require("../config/redis");

module.exports = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "Invalid token format" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const isBlacklisted = await redis.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token expired (logged out)" });
    }
  } catch (redisErr) {
    console.warn("Redis unavailable for blacklist check, proceeding:", redisErr.message);
    // Fail open: allow the request if Redis is down (token is still JWT-verified below)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
