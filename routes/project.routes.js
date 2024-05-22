const router = require("express").Router();

const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isCreator } = require("../middleware/creator.middleware");

router.post("/projects/", isAuthenticated, isCreator, (req, res) => {
  const projectId = req.params.projectId;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Project.findByIdAndUpdate(projectId, req.body, { new: true })
    .then((updatedProject) => {
      console.log("Updated project ->", updatedProject);
      res.status(200).json(updatedProject);
    })
    .catch((error) => {
      console.error("Error while updating the project ->", error);
      res.status(500).json({ error: "Failed to update the project" });
    });
});

router.get("/projects", (req, res) => {
  Project.find({})
    .then((projects) => {
      console.log("Retrieved projects ->", projects);
      res.json(projects);
    })
    .catch((error) => {
      console.error("Error while retrieving projects ->", error);
      res.status(500).json({ error: "Failed to retrieve projects" });
    });
});

router.get("/projects/:id", (req, res) => {
  const projectId = req.params.id;

  Project.findById(projectId)
    .then((project) => {
      console.log("Retrieved project ->", project);
      res.status(200).json(project);
    })
    .catch((error) => {
      console.log("Error while retrieving project ->", error);
      res.status(500).json({ error: "Failed to retrieve project" });
    });
});

// PUT /api/projects/:id - Updates a specific project by id
router.put("/projects/:id"),
  isAuthenticated,
  isCreator,
  (req, res) => {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    Project.findByIdAndUpdate(projectId, req.body, { new: true })
      .then((updatedProject) => {
        console.log("Updated project ->", updatedProject);
        res.status(200).json(updatedProject);
      })
      .catch((error) => {
        console.error("Error while updating the project ->", error);
        res.status(500).json({ error: "Failed to update the project" });
      });
  };

// DELETE /api/projects/:id - Deletes a specific project by id
router.delete("/projects/:id", isAuthenticated, isCreator, (req, res) => {
  Project.findByIdAndDelete(req.params.projectId)
    .then((result) => {
      console.log("Project deleted!");
      res.status(204).send();
    })
    .catch((error) => {
      console.error("Error while deleting the project ->", error);
      res.status(500).json({ error: "Deleting project failed" });
    });
});

module.exports = router;
