const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
    },
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    image: {
      type: String,
      default: "",
    },
    votes: [{ type: Schema.Types.ObjectId, ref: "Vote" }],
    creator: [{ type: Schema.Types.ObjectId, ref: "Creator" }],
    inProgress: { type: Boolean, default: true },
    timeCount: {
      type: Number,
      enum: [1, 2, 3, 5, 7, 14, 21, 28],
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Project = model("Project", ProjectSchema);

module.exports = Project;
