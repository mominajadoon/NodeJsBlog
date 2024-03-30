const Blog = require("../models/blogs");
const URL = require("url");

exports.getAllBlogs = async function (req, res) {
  // const blogs = blog.find();
  Blog.find()
    .then((blogs) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(blogs));
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSingleBlog = async function (req, res) {
  try {
    const { pathname } = URL.parse(req.url, true);
    const parts = pathname.split("/");
    const id = parts[parts.length - 1];
    console.log(id);
    const blog = await Blog.findById(id);

    if (blog.length < 1) {
      res.end(JSON.stringify("Blog post not found"));
      return (res.status = 404);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(blog));
  } catch (error) {
    console.log(error);
    res.end(JSON.stringify("Blog post not found"));
    return (res.status = 404);
  }
};

exports.createBlog = function (req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const blogDataFromUser = JSON.parse(body);
    const blog = new Blog(blogDataFromUser);
    blog
      .save()
      .then((result) => {
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Blog created", data: result }));
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.updateBlog = function (req, res) {
  const blogId = req.url.split("/")[3];
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const blogDataFromUser = JSON.parse(body);
    Blog.findByIdAndUpdate(blogId, blogDataFromUser, { new: true })
      .then((updatedBlog) => {
        if (!updatedBlog) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Blog not found" }));
        } else {
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Blog updated", data: updatedBlog })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.deleteBlog = async function (req, res) {
  console.log(req.url);
  const blogId = req.url.split("/")[3];
  const deleteBlog = await Blog.findByIdAndDelete(blogId);
  if (!deleteBlog) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Blog not found" }));
  } else {
    aa;
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Blog deleted" }));
  }
};
