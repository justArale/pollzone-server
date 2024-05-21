const router = require("express").Router();

const mongoose = require("mongoose");

const Creator = require("../models/Creator.model");

// POST /api/creators - Creates a new creator
router.post("/creators", (req, res) => {
  Creator.create(req.body)
    .then((createdCreator) => {
      console.log("Creator created ->", createdCreator);
      res.status(201).json(createdCreator);
    })
    .catch((error) => {
      console.log("Error while creating the creator ->", error);
      res.status(500).json({ error: "Failed to create the creator" });
    });
});

// GET /api/creators - Retrieves all of the creators in the database collection
router.get("/creators", (req, res) => {
  Creator.find({})
    .then((creators) => {
      console.log("Retrieved creators ->", creators);
      res.json(creators);
    })
    .catch((error) => {
      console.log("Error while retrieving creators ->", error);
      res.status(500).json({ error: "Failed to retrieve creators" });
    });
});

// GET /api/creators/:creatorId - Retrieves a specific creator by id
router.get("/creators/:creatorId", (req, res) => {
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
      console.log("Error while retrieving creator ->", error);
      res.status(500).json({ error: "Failed to retrieve creator" });
    });
});

// PUT /api/creators/:creatorId - Updates a specific creator by id
router.put("/creators/:creatorId", (req, res) => {
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
router.delete("/creators/:creatorId", (req, res) => {
  Creator.findByIdAndDelete(req.params.creatorId)
    .then((result) => {
      console.log("Creator deleted!");
      res.status(204).send();
    })
    .catch((error) => {
      console.log("Error while deleting the creator ->", error);
      res.status(500).json({ error: "Deleting creator failed" });
    });
});

module.exports = router;
