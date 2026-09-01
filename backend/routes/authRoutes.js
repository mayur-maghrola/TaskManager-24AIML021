const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { protect } = require("../middleware/authMiddleware");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Helper to generate JWT token with 1 hour expiration
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: "1h" }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    // Password will be automatically hashed by User model pre-save hook
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    if (user) {
      const token = generateToken(user._id);
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      return res.status(400).json({ error: "Invalid user data." });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: "Server error during registration." });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (1 hour expiry)
// @access  Public
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error during login." });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, async (req, res) => {
  return res.json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
  });
});

module.exports = router;
