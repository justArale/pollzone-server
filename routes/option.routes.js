const router = require("express").Router();

const mongoose = require("mongoose");

const Option = require("../models/Project.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isFan } = require("../middleware/fan.middleware");
const { isCreator } = require("../middleware/creator.middleware");

router.post("/options/", isAuthenticated, isCreator, (req, res) => {
  const optionsId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(optionsId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Option.findByIdAndUpdate(optionsId, req.body, { new: true })
    .then((updatedOption) => {
      console.log("Updated project ->", updatedOption);
      res.status(200).json(updatedOption);
    })
    .catch((error) => {
      console.error("Error while updating the option ->", error);
      res.status(500).json({ error: "Failed to update the option" });
    });
});

router.get("/options", (req, res) => {
  Option.find({})
    .then((options) => {
      console.log("Retrieved projects ->", options);
      res.json(options);
    })
    .catch((error) => {
      console.error("Error while retrieving options ->", error);
      res.status(500).json({ error: "Failed to retrieve options" });
    });
});

router.get("/options/:id", (req, res) => {
  const optionsId = req.params.id;

  Option.findById(optionsId)
    .then((option) => {
      console.log("Retrieved option ->", option);
      res.status(200).json(option);
    })
    .catch((error) => {
      console.log("Error while retrieving option ->", error);
      res.status(500).json({ error: "Failed to retrieve option" });
    });
});

// PUT /api/options/:id - Updates a specific project by id
router.put("/options/:id"),
  isAuthenticated,
  (req, res) => {
    const optionsId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(optionsId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Option.findByIdAndUpdate(optionsId, req.body, { new: true })
      .then((updatedOption) => {
        console.log("Updated project ->", updatedOption);
        res.status(200).json(updatedOption);
      })
      .catch((error) => {
        console.error("Error while updating the option ->", error);
        res.status(500).json({ error: "Failed to update the option" });
      });
  };

// DELETE /api/options/:id - Deletes a specific project by id
router.delete("/options/:id", isAuthenticated, isCreator, (req, res) => {
  const optionsId = req.params.id;

  Option.findByIdAndDelete(optionsId)
    .then((result) => {
      console.log("Option deleted!");
      res.status(204).send();
    })
    .catch((error) => {
      console.error("Error while deleting the option ->", error);
      res.status(500).json({ error: "Deleting option failed" });
    });
});

module.exports = router;
