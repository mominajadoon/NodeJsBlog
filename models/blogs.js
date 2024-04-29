const mongoose = require("mongoose");
const Like = require("./like");
const Dislike = require("./dislike");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imagePath: String, // Field to store the image path
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
