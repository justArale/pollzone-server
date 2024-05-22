const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the Fan model to whatever makes sense in this case
const fanSchema = new Schema(
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
      enum: ["creators", "fans"],
    },
    votes: [{ type: Schema.Types.ObjectId, ref: "Options" }],
    favoritCreators: [{ type: Schema.Types.ObjectId, ref: "Creator" }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Fan = model("Fan", fanSchema);

module.exports = Fan;
