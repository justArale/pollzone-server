const router = require("express").Router();

const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const Creator = require("../models/Creator.model");
const Option = require("../models/Option.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isCreator } = require("../middleware/creator.middleware");

// POST /creators/:creatorId/projects - Creates a new project for a specific creator
router.post(
  "/creators/:creatorId/projects",
  isAuthenticated,
  isCreator,
  async (req, res) => {
    const creatorId = req.params.creatorId;

    // Check if the authenticated user is the same as the creatorId
    if (req.payload._id !== creatorId) {
      return res.status(403).json({
        error: "You are not authorized to create a project for this creator",
      });
    }

    try {
      const { title, description, image, options, inProgress, timeCount } =
        req.body;

      // Create project
      const newProject = await Project.create({
        title,
        description,
        image,
        options,
        creator: creatorId,
        inProgress,
        timeCount,
      });

      console.log("Created new project ->", newProject);

      // Update the creator to add the new project to their projects array
      await Creator.findByIdAndUpdate(
        creatorId,
        { $push: { projects: newProject._id } },
        { new: true }
      );

      res.status(201).json(newProject);
    } catch (error) {
      console.error("Error while creating the project ->", error);
      res.status(500).json({ error: "Failed to create the project" });
    }
  }
);

// GET /projects - Retrieves all projects of all creator
router.get("/projects", (req, res) => {
  Project.find({})
    .then((projects) => {
      console.log(`Retrieved projects for creator ->`, projects);
      res.json(projects);
    })
    .catch((error) => {
      console.error("Error while retrieving projects ->", error);
      res.status(500).json({ error: "Failed to retrieve projects" });
    });
});

// GET /creators/:creatorId/projects - Retrieves all projects for a specific creator
router.get("/creators/:creatorId/projects", (req, res) => {
  const creatorId = req.params.creatorId;

  Project.find({ creator: creatorId })
    .then((projects) => {
      console.log(`Retrieved projects for creator ${creatorId} ->`, projects);
      res.json(projects);
    })
    .catch((error) => {
      console.error("Error while retrieving projects ->", error);
      res.status(500).json({ error: "Failed to retrieve projects" });
    });
});

// GET /creators/:creatorId/projects/:projectId - Retrieves a specific project for a specific creator
router.get("/creators/:creatorId/projects/:projectId", (req, res) => {
  const { creatorId, projectId } = req.params;

  Project.findOne({ _id: projectId, creator: creatorId })
    .populate("options")
    .populate("creator")
    .then((project) => {
      if (!project) {
        return res.status(404).json({
          message: "Project not found or does not belong to this creator",
        });
      }
      console.log(
        `Retrieved project ${projectId} for creator ${creatorId} ->`,
        project
      );
      res.status(200).json(project);
    })
    .catch((error) => {
      console.log("Error while retrieving project ->", error);
      res.status(500).json({ error: "Failed to retrieve project" });
    });
});

// PUT /creators/:creatorId/projects/:projectId - Updates a specific project by id
router.put(
  "/creators/:creatorId/projects/:projectId",
  isAuthenticated,
  isCreator,
  async (req, res) => {
    const { creatorId, projectId } = req.params;

    // Check if the authenticated user is the same as the creatorId
    if (req.payload._id !== creatorId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this project" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ message: "Specified project id is not valid" });
    }

    try {
      // Check if the project belongs to the creator
      const project = await Project.findOne({
        _id: projectId,
        creator: creatorId,
      });
      if (!project) {
        return res.status(404).json({
          message: "Project not found or does not belong to the creator",
        });
      }

      // Update the project
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        req.body,
        { new: true }
      );
      console.log("Updated project ->", updatedProject);
      res.status(200).json(updatedProject);
    } catch (error) {
      console.error("Error while updating the project ->", error);
      res.status(500).json({ error: "Failed to update the project" });
    }
  }
);

// DELETE /creators/:creatorId/projects/:projectId
router.delete(
  "/creators/:creatorId/projects/:projectId",
  isAuthenticated,
  isCreator,
  async (req, res) => {
    const { creatorId, projectId } = req.params;

    // Check if the authenticated user is the same as the creatorId
    if (req.payload._id !== creatorId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this project" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ message: "Specified project id is not valid" });
    }

    try {
      // Check if the project exists and belongs to the current Creator
      const project = await Project.findOne({
        _id: projectId,
        creator: creatorId,
      });
      if (!project) {
        return res
          .status(404)
          .json({ message: "Project not found or unauthorized" });
      }

      // Delete all options associated with the project
      await Option.deleteMany({ projectId: projectId });

      // Delete project
      await Project.findByIdAndDelete(projectId);

      // Remove the reference from the Creator document
      await Creator.findByIdAndUpdate(creatorId, {
        $pull: { projects: projectId },
      });

      console.log("Project and associated options deleted!");
      res.status(204).send();
    } catch (error) {
      console.error(
        "Error while deleting the project and associated options ->",
        error
      );
      res
        .status(500)
        .json({ error: "Deleting project and associated options failed" });
      console.log(error);
    }
  }
);

module.exports = router;
