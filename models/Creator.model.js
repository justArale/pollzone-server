const { Schema, model } = require("mongoose");

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
    image: String,

    socialMedia: {
      type: [String],
      default: [""],
    },
    role: {
      type: String,
      enum: ["creators", "fans"],
    },
    category: {
      type: String,
      enum: [
        "Music",
        "Sports",
        "Art",
        "Gaming",
        "Beauty",
        "Culinary",
        "Travel",
        "Fitness",
        "Film & Video",
        "Audio & Podcasts",
      ],
      required: [true, "Category is required."],
    },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    fans: [{ type: Schema.Types.ObjectId, ref: "Fan" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Creator = model("Creator", CreatorSchema);

module.exports = Creator;
