const router = require("express").Router();
const mongoose = require("mongoose");

const Fan = require("../models/Fan.model");
const Creator = require("../models/Creator.model");
const Option = require("../models/Option.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

// GET /fans - Retrieves all of the creators in the database collection
router.get("/fans", (req, res) => {
  Fan.find({})
    .then((fans) => {
      console.log("Retrieved fans ->", fans);
      res.json(fans);
    })
    .catch((error) => {
      console.error("Error while retrieving fans ->", error);
      res.status(500).json({ error: "Failing to retrieve fans" });
    });
});

// GET /fans/:id - Retrieves a specific fan by id. The route should be protected by the authentication middleware.
router.get("/fans/:id", (req, res) => {
  const fanId = req.params.id;

  Fan.findById(fanId)
    .populate("favoritCreators")
    .populate({
      path: 'votes',
      populate: {
        path: 'projectId',
        populate: {
          path: 'creator'
        }
      }
    })
    .then((fan) => {
      console.log("Retrieved fan ->", fan);
      res.status(200).json(fan);
    })
    .catch((error) => {
      console.error("Error while retrieving fan ->", error);
      res.status(500).json({ error: "Failed to retrieve fan" });
    });
});

// PUT /fans/:id - Updates a specific fan by id
router.put("/fans/:id", isAuthenticated, (req, res) => {
  const fanId = req.params.id;

  // Check if the authenticated user is the same as the fanId
  if (req.payload._id !== fanId) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update the creator" });
  }

  if (!mongoose.Types.ObjectId.isValid(fanId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Fan.findByIdAndUpdate(fanId, req.body, { new: true })
    .then((updatedFan) => {
      console.log("Updated fan ->", updatedFan);
      res.status(200).json(updatedFan);
    })
    .catch((error) => {
      console.error("Error while updating the fan ->", error);
      res.status(500).json({ error: "Failed to update the fan" });
    });
});

// DELETE /fans/:id - Deletes a specific fan by id
router.delete("/fans/:id", isAuthenticated, async (req, res) => {
  const fanId = req.params.id;

  // Check if the authenticated user is the same as the fanId
  if (req.payload._id !== fanId) {
    return res
      .status(403)
      .json({ error: "You are not authorized to delete this fan" });
  }

  if (!mongoose.Types.ObjectId.isValid(fanId)) {
    return res.status(400).json({ message: "Specified fan id is not valid" });
  }

  try {
    // Collect all votes of the fan
    const fan = await Fan.findById(fanId).populate("votes");

    if (fan && fan.votes.length > 0) {
      // Update the counter of each option the fan has voted for
      for (const option of fan.votes) {
        await Option.findByIdAndUpdate(option._id, { $inc: { counter: -1 } });
      }
    }

    // Remove the fan from the fans-array of all creators
    await Creator.updateMany({ fans: fanId }, { $pull: { fans: fanId } });

    // Delete the fan
    await Fan.findByIdAndDelete(fanId);

    console.log("Fan and associated votes updated!");
    res.status(204).send();
  } catch (error) {
    console.error("Error while deleting the fan and updating votes ->", error);
    res.status(500).json({ error: "Deleting fan and updating votes failed" });
  }
});

module.exports = router;
