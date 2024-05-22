const router = require("express").Router();

const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isCreator } = require("../middleware/creator.middleware");

// req.body = {username: "bob", _id:"sasd", role: "Creator"}
// isCreator = if (req.payload.role === "Creator") {next()}

router.post("/project/", isAuthenticated, isCreator, (req, res) => {
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

module.exports = router;
