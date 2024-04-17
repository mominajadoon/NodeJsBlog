const Blog = require("../models/blogs");
const { ObjectId } = require("mongodb");
const { default: slugify } = require("slugify");
const { like } = require("../models/like");
const { dislike } = require("../models/dislike");

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
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
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
      // console.log(slug);
      const newBlog = await Blog.createBlog(title, body, slug);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Blog created", data: newBlog }));
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
      const slug = slugify(title, "-");
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
    const blogId = req.params.blogId;
    const userId = req.params.userId;
    const result = await like(blogId, userId);

    if (result.error) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: result.error }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: result.message }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

// Dislike blog function
exports.dislike = async function (req, res) {
  try {
    const blogId = req.params.blogId;
    const userId = req.params.userId;
    const result = await dislike(blogId, userId);

    if (result.error) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: result.error }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: result.message }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

// count likes on blogs
exports.countUserLikes = async function (req, res) {
  try {
    const userId = req.params.userId;
    const likedBlogs = await Blog.countUserLikes(userId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ likedBlogs }));
  } catch (error) {
    console.error("Error counting user likes:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
