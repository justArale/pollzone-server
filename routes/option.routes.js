const router = require("express").Router();

const mongoose = require("mongoose");

const Option = require("../models/Option.model");
const Project = require("../models/Project.model");
const Fan = require("../models/Fan.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isFan } = require("../middleware/fan.middleware");
const { isCreator } = require("../middleware/creator.middleware");

// POST /creators/:creatorId/projects/:projectId/options - Creates a new option for a specific project
router.post(
  "/creators/:creatorId/projects/:projectId/options",
  isAuthenticated,
  isCreator,
  async (req, res) => {
    const { title, description, image } = req.body;
    const { projectId } = req.params;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: "Specified project id is not valid" });
      return;
    }

    try {
      const newOption = await Option.create({
        title,
        description,
        image,
        projectId,
      });
      console.log("Created new option ->", newOption);

      // Update the project to add the new option to its options array
      await Project.findByIdAndUpdate(
        projectId,
        { $push: { options: newOption._id } },
        { new: true }
      );

      res.status(201).json(newOption);
    } catch (error) {
      console.error("Error while creating the option ->", error);
      res.status(500).json({ error: "Failed to create the option" });
    }
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
    const optionId = req.params.optionId;

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

// PUT /creators/:creatorId/projects/:projectId/options/:optionsId - Updates a specific option by id (for fans and creators)
router.put(
  "/creators/:creatorId/projects/:projectId/options/:optionsId",
  isAuthenticated,
  async (req, res) => {
    const { creatorId, projectId, optionsId } = req.params;

    // Check if the user is a fan or creator
    if (req.payload.role === "fans") {
      // If the user is a fan, call the update function for fans
      await updateOptionForFan(req, res, optionsId);
      // Add the option ID to the fan's votes
      await Fan.findByIdAndUpdate(req.payload._id, {
        $addToSet: { votes: optionsId },
      });
    } else if (req.payload.role === "creators") {
      // If the user is a creator, call the update function for creators
      await updateOptionForCreator(req, res, creatorId, projectId, optionsId);
    } else {
      res.status(403).json({ message: "Unauthorized user role" });
    }
  }
);

// Function to update option for fans
async function updateOptionForFan(req, res, optionsId) {
  try {
    const updatedOption = await Option.findByIdAndUpdate(optionsId, req.body, {
      new: true,
    });
    if (!updatedOption) {
      return res.status(404).json({ message: "Option not found" });
    }

    console.log("Updated option ->", updatedOption);
    res.status(200).json(updatedOption);
  } catch (error) {
    console.error("Error while updating the option ->", error);
    res.status(500).json({ error: "Failed to update the option" });
  }
}

// Function to update option for creators
async function updateOptionForCreator(
  req,
  res,
  creatorId,
  projectId,
  optionsId
) {
  // Check if the logged-in creator is the owner of the project
  if (req.payload._id !== creatorId) {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform this action" });
  }

  // Check if the option belongs to a project of the logged-in creator
  const project = await Project.findOne({
    _id: projectId,
    creator: creatorId,
  });
  if (!project) {
    return res
      .status(404)
      .json({ message: "Project not found or unauthorized" });
  }

  // Update the option
  await updateOptionForFan(req, res, optionsId);
}

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
