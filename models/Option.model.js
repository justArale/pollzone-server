const { Schema, model } = require("mongoose");

const OptionsSchema = new Schema({
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
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Project ID is required."],
  },
  counter: {
    type: Number,
    default: 0,
  },
});

const Option = model("Option", OptionsSchema);

module.exports = Option;
