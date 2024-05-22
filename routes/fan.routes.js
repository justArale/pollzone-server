const router = require("express").Router();
const mongoose = require("mongoose");

const Fan = require("../models/Fan.model");

// GET /api/fans - Retrieves all of the creators in the database collection
router.get("/fans", (req, res) => {
  Fan.find({})
    .then((fans) => {
      console.log("Retrieved fans ->", fans);
      res.json(fans);
    })
    .catch((error) => {
      console.error("Error while retrieving fans ->", error);
      res.status(500).json({ error: "Failing to retrieve fans" });
    });
});

// GET /api/fans/:id - Retrieves a specific fan by id. The route should be protected by the authentication middleware.
router.get("/fans/:id", (req, res) => {
  const fanId = req.params.id;

  Fan.findById(fanId)
    .then((fan) => {
      console.log("Retrieved fan ->", fan);
      res.status(200).json(fan);
    })
    .catch((error) => {
      console.error("Error while retrieving fan ->", error);
      res.status(500).json({ error: "Failed to retrieve fan" });
    });
});

module.exports = router;
