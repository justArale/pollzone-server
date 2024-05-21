const router = require("express").Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");

// GET /api/users/:id - Retrieves a specific user by id. The route should be protected by the authentication middleware.
router.get("/users/:id", (req, res) => {
  const UserId = req.params.id;

  User.findById(UserId)
    .then((User) => {
      console.log("Retrieved User ->", User);
      res.status(200).json(User);
    })
    .catch((error) => {
      console.log("Error while retrieving User ->", error);
      res.status(500).json({ error: "Failed to retrieve User" });
    });
});

module.exports = router;
