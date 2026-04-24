const express = require("express");
const router = express.Router();
const { addToWishlist, removeFromWishlist, getMyWishlist, checkWishlist } = require("../controllers/wishlistController");
const auth = require("../middleware/auth");

// /my and /check/:courseId must come before /:courseId to avoid route shadowing
router.get("/my", auth, getMyWishlist);
router.get("/check/:courseId", auth, checkWishlist);
router.post("/:courseId", auth, addToWishlist);
router.delete("/:courseId", auth, removeFromWishlist);

module.exports = router;
