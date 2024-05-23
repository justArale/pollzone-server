const router = require("express").Router();

const mongoose = require("mongoose");

const Option = require("../models/Option.model");
const Project = require("../models/Project.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isFan } = require("../middleware/fan.middleware");
const { isCreator } = require("../middleware/creator.middleware");

router.post("/options", isAuthenticated, isCreator, (req, res) => {
  const { title, description, projectId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified project id is not valid" });
    return;
  }

  Option.create({ title, description, projectId })
    .then((newOption) => {
      console.log("Created new option ->", newOption);

      // Update the project to add the new option to its options array
      return Project.findByIdAndUpdate(
        projectId,
        { $push: { options: newOption._id } },
        { new: true }
      ).then(() => newOption); // return the new option after updating the project
    })
    .then((newOption) => {
      res.status(201).json(newOption);
    })
    .catch((error) => {
      console.error("Error while creating the option ->", error);
      res.status(500).json({ error: "Failed to create the option" });
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
  const optionId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(optionId)) {
    res.status(400).json({ message: "Specified option id is not valid" });
    return;
  }

  Option.findByIdAndDelete(optionId)
    .then((deletedOption) => {
      if (!deletedOption) {
        res.status(404).json({ message: "Option not found" });
        return;
      }
      console.log("Option deleted!");

      // Remove the reference from the associated project
      return Project.findByIdAndUpdate(
        deletedOption.projectId,
        { $pull: { options: optionId } },
        { new: true }
      );
    })
    .then((updatedProject) => {
      if (updatedProject) {
        console.log("Reference removed from project!");
      }
      res.status(204).send();
    })
    .catch((error) => {
      console.error("Error while deleting the option ->", error);
      res.status(500).json({ error: "Deleting option failed" });
    });
});
module.exports = router;
