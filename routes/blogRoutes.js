const blogController = require("../controllers/blogController");
const { getAllBlogs, getSingleBlog, createBlog, updateBlog, deleteBlog } =
  blogController;
const URL = require("url");

function blogRoutes(req, res) {
  const { method, url } = req;
  const { pathname } = URL.parse(url);
  console.log("Request pathname:", pathname);
  if (method === "GET" && pathname === "/api/blogs") {
    getAllBlogs(req, res);
  } else if (method === "GET" && pathname.startsWith("/api/blogs/")) {
    getSingleBlog(req, res);
  } else if (method === "POST" && pathname === "/api/blogs") {
    createBlog(req, res);
  } else if (method === "PUT" && pathname.startsWith("/api/blogs/")) {
    updateBlog(req, res);
  } else if (method === "DELETE" && pathname.startsWith("/api/blogs/")) {
    deleteBlog(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify("not found"));
  }
}
module.exports = blogRoutes;
