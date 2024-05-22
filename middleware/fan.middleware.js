// const jwt = require("jsonwebtoken");

const isFan = (req, res, next) => {
  if (req.payload && req.payload.role === "fans") {
    next(); // Weiter zur nächsten Middleware oder Route
  } else {
    res.status(401).json({ message: "Unauthorized: Only Fans are allowed." });
  }
};

module.exports = { isFan };
