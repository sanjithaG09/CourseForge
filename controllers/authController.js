const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
    try {
      console.log("Signup API called"); // 👈 debug
  
      const { name, email, password } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role:"admin"
      });
  
      res.json({ message: "User registered successfully" });
  
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ message: "Error in signup" });
    }
  };

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
};

const blacklist = require("../middleware/blacklist");

exports.logout = (req, res) => {
  const token = req.header("Authorization").split(" ")[1];

  blacklist.push(token);  // 🚫 block token

  res.json({ message: "Logged out successfully" });
};

exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  };

  exports.updateProfile = async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );
    res.json(user);
  };

  exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    const user = await User.findById(req.user.id);
  
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }
  
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  
    res.json({ message: "Password updated successfully" });
  };