const router = require("express").Router();
const mongoose = require("mongoose");

const Creator = require("../models/Creator.model");
const Fan = require("../models/Fan.model");
const Project = require("../models/Project.model");
const Option = require("../models/Option.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");
const { isCreator } = require("../middleware/creator.middleware");

// GET /creators - Retrieves all of the creators in the database collection
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

// GET /creators/:id - Retrieves a specific creator by id
router.get("/creators/:id", (req, res) => {
  const creatorId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  Creator.findById(creatorId)
    .populate("projects")
    .then((creator) => {
      console.log("Retrieved creator ->", creator);
      res.status(200).json(creator);
    })
    .catch((error) => {
      console.error("Error while retrieving creator ->", error);
      res.status(500).json({ error: "Failed to retrieve creator" });
    });
});

// PUT /creators/:id - Updates a specific creator by id
router.put("/creators/:id", isAuthenticated, isCreator, (req, res) => {
  const creatorId = req.params.id;

  // Check if the authenticated user is the same as the creatorId
  if (req.payload._id !== creatorId) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update the creator" });
  }

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

// PUT /creators/:creatorId/fans/:fanId/toggleFollow - Fan follows or unfollows a creator
router.put(
  "/creators/:creatorId/fans/:fanId/toggleFollow",
  isAuthenticated,
  async (req, res) => {
    const { fanId, creatorId } = req.params;

    // Check if the IDs are valid
    if (
      !mongoose.Types.ObjectId.isValid(fanId) ||
      !mongoose.Types.ObjectId.isValid(creatorId)
    ) {
      return res
        .status(400)
        .json({ message: "Specified fan or creator id is not valid" });
    }

    try {
      // Check if the fan and creator exist
      const fan = await Fan.findById(fanId);
      const creator = await Creator.findById(creatorId);

      if (!fan) {
        return res.status(404).json({ message: "Fan not found" });
      }

      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      // Determine whether to follow or unfollow
      const isFollowing = fan.favoritCreators.includes(creatorId);

      if (isFollowing) {
        // Unfollow: Remove the creator from the fan's favoritCreators array
        // and remove the fan from the creator's fans array
        await Fan.findByIdAndUpdate(
          fanId,
          { $pull: { favoritCreators: creatorId } },
          { new: true }
        );

        await Creator.findByIdAndUpdate(
          creatorId,
          { $pull: { fans: fanId } },
          { new: true }
        );

        res.status(200).json({ message: "Unfollowed the creator" });
      } else {
        // Follow: Add the creator to the fan's favoritCreators array
        // and add the fan to the creator's fans array
        const updatedFan = await Fan.findByIdAndUpdate(
          fanId,
          { $addToSet: { favoritCreators: creatorId } }, // $addToSet ensures no duplicates
          { new: true }
        );

        const updatedCreator = await Creator.findByIdAndUpdate(
          creatorId,
          { $addToSet: { fans: fanId } }, // $addToSet ensures no duplicates
          { new: true }
        );

        res.status(200).json({ fan: updatedFan, creator: updatedCreator });
      }
    } catch (error) {
      console.error("Error while toggling follow status ->", error);
      res.status(500).json({ error: "Failed to toggle follow status" });
    }
  }
);

// DELETE /creators/:id - Deletes a specific creator by id
router.delete("/creators/:id", isAuthenticated, async (req, res) => {
  const creatorId = req.params.id;

  // Check if the authenticated user is the same as the creatorId
  if (req.payload._id !== creatorId) {
    return res
      .status(403)
      .json({ error: "You are not authorized to delete the creator" });
  }

  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    return res
      .status(400)
      .json({ message: "Specified creator id is not valid" });
  }

  try {
    // Collect all projects of the creator
    const projects = await Project.find({ creator: creatorId });

    if (projects.length > 0) {
      // Extract the project IDs
      const projectIds = projects.map((project) => project._id);

      // Delete all options belonging to the projects
      await Option.deleteMany({ projectId: { $in: projectIds } });

      // Delete all projects of the creator
      await Project.deleteMany({ creator: creatorId });
    }

    // Remove the creator from the favoritCreators array of all fans
    await Fan.updateMany(
      { favoritCreators: creatorId },
      { $pull: { favoritCreators: creatorId } }
    );

    // Delete the creator
    await Creator.findByIdAndDelete(creatorId);

    console.log("Creator and associated projects/options deleted!");
    res.status(204).send();
  } catch (error) {
    console.error(
      "Error while deleting the creator and associated data ->",
      error
    );
    res
      .status(500)
      .json({ error: "Deleting creator and associated data failed" });
  }
});

module.exports = router;
