const { Schema, model } = require("mongoose");

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
    options: [{ type: Schema.Types.ObjectId, ref: "Option" }],
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Creator",
      required: [true, "Project ID is required."],
    },
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
