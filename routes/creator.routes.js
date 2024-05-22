const router = require("express").Router();
const mongoose = require("mongoose");

const Creator = require("../models/Creator.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// GET /api/creators - Retrieves all of the creators in the database collection
router.get("/creators", (req, res) => {
  Creator.find({})
    .then((creators) => {
      console.log("Retrieved creators ->", creators);
      res.json(creators);
    })
    .catch((error) => {
      console.error("Error while retrieving creators ->", error);
      res.status(500).json({ error: "Failed to retrieve creators" });
    });
});

// GET /api/creators/:id - Retrieves a specific creator by id
router.get("/creators/:id", (req, res) => {
  const creatorID = req.params.creatorId;

  if (!mongoose.Types.ObjectId.isValid(creatorID)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  Creator.findById(creatorID)
    .then((creator) => {
      console.log("Retrieved creator ->", creator);
      res.status(200).json(creator);
    })
    .catch((error) => {
      console.error("Error while retrieving creator ->", error);
      res.status(500).json({ error: "Failed to retrieve creator" });
    });
});

// PUT /api/creators/:creatorId - Updates a specific creator by id

router.put("/creators/:id", isAuthenticated, (req, res) => {
  const creatorId = req.params.creatorId;

  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Creator.findByIdAndUpdate(creatorId, req.body, { new: true })
    .then((updatedCreator) => {
      console.log("Updated creator ->", updatedCreator);
      res.status(200).json(updatedCreator);
    })
    .catch((error) => {
      console.error("Error while updating the creator ->", error);
      res.status(500).json({ error: "Failed to update the creator" });
    });
});

// DELETE /api/creators/:creatorId - Deletes a specific creator by id
router.delete("/creators/:Id", isAuthenticated, (req, res) => {
  Creator.findByIdAndDelete(req.params.creatorId)
    .then((result) => {
      console.log("Creator deleted!");
      res.status(204).send();
    })
    .catch((error) => {
      console.error("Error while deleting the creator ->", error);
      res.status(500).json({ error: "Deleting creator failed" });
    });
});

module.exports = router;
