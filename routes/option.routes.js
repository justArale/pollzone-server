const router = require("express").Router();

const mongoose = require("mongoose");

const Option = require("../models/Option.model");
const Project = require("../models/Project.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isFan } = require("../middleware/fan.middleware");
const { isCreator } = require("../middleware/creator.middleware");

// POST /creators/:creatorId/projects/:projectId/options - Creates a new option for a specific project
router.post(
  "/creators/:creatorId/projects/:projectId/options",
  isAuthenticated,
  isCreator,
  (req, res) => {
    const { title, description } = req.body;
    const { projectId } = req.params;

    // Validate project ID
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
  }
);

// GET /creators/:creatorId/projects/:projectId/options - Retrieves all options of a specific project
router.get("/creators/:creatorId/projects/:projectId/options", (req, res) => {
  const projectId = req.params.projectId;

  Option.find({ projectId: projectId })
    .then((options) => {
      console.log("Retrieved options ->", options);
      res.json(options);
    })
    .catch((error) => {
      console.error("Error while retrieving options ->", error);
      res.status(500).json({ error: "Failed to retrieve options" });
    });
});

// GET http://localhost:5005/api/creators/:creatorId/projects/:projectId/options/:optionsId - Retrieves a specific options of a specific project
router.get(
  "/creators/:creatorId/projects/:projectId/options/:optionId",
  isAuthenticated,
  (req, res) => {
    const optionId = req.params.optionId; // Verwende optionId statt optionsId

    Option.findById(optionId)
      .then((option) => {
        if (!option) {
          return res.status(404).json({ message: "Option not found" });
        }
        console.log("Retrieved option ->", option);
        res.status(200).json(option);
      })
      .catch((error) => {
        console.log("Error while retrieving option ->", error);
        res.status(500).json({ error: "Failed to retrieve option" });
      });
  }
);

// PUT /api/creators/:creatorId/projects/:projectId/options/:optionsId - Updates a specific project by id
router.put(
  "/creators/:creatorId/projects/:projectId/options/:optionsId",
  isAuthenticated,
  (req, res) => {
    const optionsId = req.params.optionsId; // Korrektur: optionsId statt id

    if (!mongoose.Types.ObjectId.isValid(optionsId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Option.findByIdAndUpdate(optionsId, req.body, { new: true })
      .then((updatedOption) => {
        console.log("Updated option ->", updatedOption);
        res.status(200).json(updatedOption);
      })
      .catch((error) => {
        console.error("Error while updating the option ->", error);
        res.status(500).json({ error: "Failed to update the option" });
      });
  }
);

// DELETE /api/creators/:creatorId/projects/:projectId/options/:optionsId - Deletes a specific project by id
router.delete(
  "/creators/:creatorId/projects/:projectId/options/:optionsId",
  isAuthenticated,
  isCreator,
  (req, res) => {
    const optionId = req.params.optionsId; // Korrektur: Verwende optionsId

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
  }
);

module.exports = router;
