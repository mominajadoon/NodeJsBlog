const mongoose = require("mongoose");

const DislikeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true,
  },
});

const Dislike = mongoose.model("Dislike", DislikeSchema);

module.exports = Dislike;
