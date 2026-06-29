const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");
const { generateOtp, sendOtpEmail } = require("../services/email.service");

const router = express.Router();

function signAccessToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, email, phone, passwordHash });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password || "", user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been suspended. Please contact AIAA support." });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshTokens.push(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/otp/request - sends a 6-digit code to the user's email
// (SMS OTP requires an SMS gateway account - swap sendOtpEmail for an SMS
// provider call here once you have credentials, e.g. MSG91 or Twilio.)
router.post("/otp/request", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp);
    res.json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/otp/verify
router.post("/otp/verify", async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !user.otpCode) return res.status(400).json({ message: "Request an OTP first" });

    if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken is required" });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    req.user.refreshTokens = req.user.refreshTokens.filter((t) => t !== refreshToken);
    await req.user.save();
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// PATCH /api/auth/me - update editable profile fields (not email/role/password)
router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { fullName, headline, bio, phone } = req.body;
    if (fullName !== undefined) req.user.fullName = fullName;
    if (headline !== undefined) req.user.headline = headline;
    if (bio !== undefined) req.user.bio = bio;
    if (phone !== undefined) req.user.phone = phone;
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/me/avatar - upload/replace profile photo
router.post("/me/avatar", requireAuth, uploadImage.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "An image file is required" });
    req.user.avatarUrl = `/uploads/${req.file.filename}`;
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
