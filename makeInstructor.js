require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/courseforge")
  .then(async () => {
    const result = await User.updateOne(
      { email: "instructor@test.com" },
      { $set: { role: "instructor" } }
    );
    console.log("Done:", result);
    process.exit();
  })

  .catch(err => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
