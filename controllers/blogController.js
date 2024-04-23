const Blog = require("../models/blogs");
const { ObjectId } = require("mongodb");
const { default: slugify } = require("slugify");
const { like } = require("../models/like");
const { dislike } = require("../models/dislike");
const { findUserByEmail } = require("../models/user");
const { blogExsits } = require("../models/blogs");

// Get all blogs
exports.getAllBlogs = async function (req, res) {
  try {
    const allBlogs = await Blog.getAllBlogs();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(allBlogs));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
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
    const blog = await Blog.findSingle(id); // Call getSingleBlog function with blogId
    if (!blog) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Blog post not found" }));
      return;
    }
    res.end(JSON.stringify({ blog }));
    res.status = 200;
    return;
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
    return;
  }
};

// create new blog
exports.createBlog = async function (req, res) {
  let bd = "";
  req.on("data", (chunk) => {
    bd += chunk.toString();
  });
  req.on("end", async () => {
    try {
      // Check if request body is not empty
      if (!bd.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Empty request body" }));
        return;
      }
      // Check if incoming data is valid JSON format
      let jsonData;
      try {
        jsonData = JSON.parse(bd);
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
        return;
      }
      const { title, body } = JSON.parse(bd);
      // Check if title or body is empty
      if (!title || !body) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and body are required" }));
        return;
      }
      const slug = slugify(title, "-");
      // Check if a blog with the same slug already exists
      const existingBlog = await Blog.existingBlog(slug);

      if (existingBlog) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Blog already exists with this title" })
        );
        return;
      }
      const newBlog = await Blog.createBlog(title, body, slug);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ message: "Blog created", data: { title, body, slug } })
      );
      // Do not close the MongoDB connection here
    } catch (err) {
      console.log(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
};

// update blogs
exports.updateBlog = async function (req, res) {
  const blogId = req.params.id;
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    try {
      // Check if request body is not empty
      if (!body.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Empty request body" }));
        return;
      }
      // Check if incoming data is valid JSON format
      let jsonData;
      try {
        jsonData = JSON.parse(body);
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
        return;
      }
      const blogDataFromUser = JSON.parse(body);
      const { title, body: blogBody } = blogDataFromUser;
      if (!title || !blogBody) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and body are required" }));
        return;
      }

      // Validate if id is a valid ObjectId
      if (!ObjectId.isValid(blogId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid ID" }));
        return;
      }
      const slug = slugify(title, "-");
      const existingBlog = await Blog.existingBlog(slug);

      if (existingBlog) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Blog already Updated with this title" })
        );
        return;
      }
      const updatedFields = {
        title: title,
        body: blogBody,
        slug: slug,
      };
      const result = await Blog.updateBlog(blogId, updatedFields);

      if (result.matchedCount === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Blog not found" }));
      } else {
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Blog updated", updatedFields }));
      }
    } catch (err) {
      console.log(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
};

// delete blog
exports.deleteBlog = async function (req, res) {
  try {
    const blogId = req.params.id;
    if (!ObjectId.isValid(blogId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid ID" }));
      return;
    }
    const result = await Blog.deleteBlog(blogId);

    if (result.deletedCount === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Blog not found" }));
    } else {
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Blog deleted" }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

// like blogs
exports.like = async function (req, res) {
  try {
    // const userId = req.params.userId;
    const blogId = req.params.blogId;
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;

    // Check if both blogId and userId are valid ObjectIds
    if (!ObjectId.isValid(blogId) || !ObjectId.isValid(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid ID" }));
      return;
    }
    const result = await blogExsits(blogId);
    if (result === "existing") {
      const likestate = await like(blogId, userId);
      if (likestate === "already liked") {
        res
          .status(400)
          .json({ error: "You have already liked this blog post" });
      } else {
        res.status(200).json({ message: "Blog liked" });
      }
    } else {
      res.status(404).json({ error: "Blog does not exist" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Dislike blog function
exports.dislike = async function (req, res) {
  try {
    // const userId = req.params.userId;
    const blogId = req.params.blogId;
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;
    if (!ObjectId.isValid(blogId) || !ObjectId.isValid(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid ID" }));
      return;
    }
    const result = await blogExsits(blogId);
    if (result === "existing") {
      const likestate = await dislike(blogId, userId);
      if (likestate === "already Disliked") {
        res
          .status(400)
          .json({ error: "You have already liked this blog post" });
      } else {
        res.status(200).json({ message: "Blog Disliked" });
      }
    } else {
      res.status(404).json({ error: "Blog does not exist" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// count likes on blogs
exports.countUserLikes = async function (req, res) {
  try {
    const userId = req.params.userId;
    if (!ObjectId.isValid(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid ID" }));
      return;
    }
    const likedBlogs = await Blog.countUserLikes(userId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ likedBlogs }));
  } catch (error) {
    console.error("Error counting user likes:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
