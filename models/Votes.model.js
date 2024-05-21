const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const VoteSchema = new Schema({
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
  project: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  counter: {
    type: Number,
    default: 0,
  },
});

const Vote = model("Vote", VoteSchema);

module.exports = Vote;
