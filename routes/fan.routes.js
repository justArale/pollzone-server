const router = require("express").Router();
const mongoose = require("mongoose");

const Fan = require("../models/Fan.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

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

// PUT /api/fans/:id - Updates a specific fan by id
router.put("/fans/:id", isAuthenticated, (req, res) => {
  const fanId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(fanId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Fan.findByIdAndUpdate(fanId, req.body, { new: true })
    .then((updatedFan) => {
      console.log("Updated fan ->", updatedFan);
      res.status(200).json(updatedFan);
    })
    .catch((error) => {
      console.error("Error while updating the fan ->", error);
      res.status(500).json({ error: "Failed to update the fan" });
    });
});

// DELETE /api/fans/:id - Deletes a specific fan by id
router.delete("/fans/:id", isAuthenticated, (req, res) => {
  Fan.findByIdAndDelete(req.params.id)
    .then((result) => {
      console.log("Fan deleted!");
      res.status(204).send();
    })
    .catch((error) => {
      console.error("Error while deleting the fan ->", error);
      res.status(500).json({ error: "Deleting fan failed" });
    });
});

module.exports = router;
