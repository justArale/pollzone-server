const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const CreatorSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    description: String,
    image: {
      type: String,
      default: "",
    },
    socialMedia: {
      type: [String],
      default: [""],
    },
    role: {
      type: String,
      enum: ["Creator", "User"],
    },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Creator = model("Creator", CreatorSchema);

module.exports = Creator;
