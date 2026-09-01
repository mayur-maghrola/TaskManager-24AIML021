const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_jwt_secret"
      );

      // Find user and attach to request without password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ error: "Not authorized, user not found" });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res
        .status(401)
        .json({ error: "Not authorized, token failed or expired" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ error: "Not authorized, no authorization token provided" });
  }
};

module.exports = { protect };
