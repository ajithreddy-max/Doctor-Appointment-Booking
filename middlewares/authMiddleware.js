const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    console.log("Auth middleware - Authorization header:", req.headers["authorization"]);
    const token = req.headers["authorization"].split(" ")[1];
    console.log("Auth middleware - Token:", token);
    jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-here-please-change-this-in-production", (err, decoded) => {
      if (err) {
        console.log("Auth middleware - JWT verification error:", err);
        return res.status(401).send({
          message: "Auth failed: " + err.message,
          success: false,
        });
      } else {
        console.log("Auth middleware - Decoded token:", decoded);
        // Attach user id in a safe place for all HTTP methods
        req.userId = decoded.id;
        // Keep backward compatibility for existing POST handlers
        if (!req.body) req.body = {};
        if (!req.body.userId) req.body.userId = decoded.id;
        console.log("Auth middleware - Set userId:", req.body.userId);
        next();
      }
    });
  } catch (error) {
    return res.status(401).send({
      message: "Auth failed",
      success: false,
    });
  }
};
