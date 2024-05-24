// const jwt = require("jsonwebtoken");

const isCreator = (req, res, next) => {
  if (req.payload && req.payload.role === "creators") {
    next(); // Weiter zur nächsten Middleware oder Route
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized: Only Creators are allowed." });
  }
};

module.exports = { isCreator };
