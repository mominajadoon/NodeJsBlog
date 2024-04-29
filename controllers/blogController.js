const Blog = require("../models/blogs");
const User = require("../models/user");
const { ObjectId } = require("mongodb");
const { default: slugify } = require("slugify");
const Like = require("../models/like");
const mongoose = require("mongoose");
const Dislike = require("../models/dislike");
const { generateToken, verifyToken } = require("../util/token");

// Get all blogs
exports.getAllBlogs = async function (req, res) {
  try {
    const allBlogs = await Blog.find();
    res.status(200).json(allBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// for single blog
exports.getSingleBlog = async function (req, res) {
  try {
    const id = req.params.id;
    // Validate if id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid ID" }));
      return;
    }
    const blog = await Blog.findById(id); // Call getSingleBlog function with blogId
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    return res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching single blog:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Create new blog post
exports.createBlog = async function (req, res) {
  try {
    // Check if request body is not empty
    if (!req.body) {
      return res.status(400).json({ error: "Empty request body" });
    }
    const { title, body } = req.body;
    // Check if title or body is empty
    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }
    // Check if request body can be parsed as JSON without errors
    try {
      JSON.parse(JSON.stringify(req.body));
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    const slug = slugify(title, "-");
    // Check if a blog with the same slug already exists
    const existingBlog = await Blog.findOne({ slug });

    if (existingBlog) {
      return res
        .status(400)
        .json({ error: "Blog already exists with this title" });
    }
    // Extract the image path from the request object
    const imagePath = req.file ? req.file.path : "";
    const fields = { title, body, slug };
    const newBlog = new Blog(fields);
    await newBlog.save();
    return res.status(201).json({
      message: "Blog created",
      data: { title, body, slug, imagePath },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// update blogs
exports.updateBlog = async function (req, res) {
  const blogId = req.params.id;
  try {
    // Check if request body is not empty
    if (!req.body) {
      return res.status(400).json({ error: "Empty request body" });
    }

    const { title, body: blogBody } = req.body;
    // Check if request body can be parsed as JSON without errors
    try {
      JSON.parse(JSON.stringify(req.body));
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON format" });
    }
    // Check if title or body is empty
    if (!title || !blogBody) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    // Validate if id is a valid ObjectId
    if (!ObjectId.isValid(blogId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    // Generate slug from title
    const slug = slugify(title, "-");

    // Check if a blog with the same slug already exists
    const existingBlog = await Blog.findOne({
      slug,
    });

    if (existingBlog) {
      return res
        .status(400)
        .json({ error: "Blog already exists with this title" });
    }

    // Update the blog
    const updatedFields = { title, body: blogBody, slug };
    const result = await Blog.updateOne({ _id: blogId }, updatedFields);

    if (result.n === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res.status(200).json({ message: "Blog updated", updatedFields });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a blog post
exports.deleteBlog = async function (req, res) {
  try {
    const blogId = req.params.id;

    // Validate if id is a valid ObjectId
    if (!ObjectId.isValid(blogId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    // Check if the blog exists in the like collection
    const likeResult = await Like.deleteOne({ blogId: blogId });
    // Check if the blog exists in the dislike collection
    const dislikeResult = await Dislike.deleteOne({ blogId: blogId });
    const result = await Blog.deleteOne({ _id: blogId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Blog not found" });
    } else {
      return res.status(200).json({ message: "Blog deleted" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// like blogs
exports.like = async function (req, res) {
  try {
    const blogId = req.params.blogId;
    const email = req.user.email;
    const user = await User.findOne({ email });
    const userId = user._id;

    if (!ObjectId.isValid(blogId)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    // Check if userId is available
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    // Check if the blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      res.status(404).json({ error: "Blog does not exist" });
      return;
    }
    // Check if the user has already liked the blog
    const existingLike = await Like.findOne({
      userId,
      blogId,
    });
    if (existingLike) {
      res.status(400).json({ error: "You have already liked this blog post" });
      return;
    }
    // Create a new like
    const newLike = new Like({ userId, blogId });
    await newLike.save();

    res.status(200).json({ message: "Blog liked" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Dislike blog function
exports.dislike = async function (req, res) {
  try {
    const blogId = req.params.blogId;
    const email = req.user.email;
    const user = await User.findOne({ email });

    // Check if user exists
    const userId = user._id;

    // Check if both blogId and userId are valid ObjectIds
    if (!ObjectId.isValid(blogId)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    // Check if the blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      res.status(404).json({ error: "Blog does not exist" });
      return;
    }
    // Check if the user has already liked the blog
    const existingDisLike = await Dislike.findOne({
      userId,
      blogId,
    });
    if (existingDisLike) {
      res
        .status(400)
        .json({ error: "You have already Disliked this blog post" });
      return;
    }
    // Create a new Dislike
    const newDislike = new Dislike({ userId, blogId });
    await newDislike.save();

    res.status(200).json({ message: "Blog Disliked" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get liked blogs by user
exports.getLikedBlogsByUser = async function (req, res) {
  try {
    const userId = req.params.userId;
    // Check if userId is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    // Find liked blogs by user using the Like model and populate the blogId field
    const likedBlogs = await Like.find({ userId }).populate(
      "blogId",
      "-_id title body slug"
    );

    return res.status(200).json(likedBlogs.map((like) => like.blogId));
  } catch (error) {
    console.error("Error fetching liked blogs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
