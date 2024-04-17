const blogController = require("../controllers/blogController");
const {
  getAllBlogs,
  getSingleBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  like,
  dislike,
  countLikes,
  countUserLikes,
} = blogController;
const URL = require("url");
const { verifyToken } = require("../util/token");

function blogRoutes(req, res) {
  const { method, url } = req;
  const { pathname } = URL.parse(url);

  console.log("Request pathname:", pathname);

  if (method === "GET" && pathname === "/api/blogs") {
    getAllBlogs(req, res);
  } else if (method === "GET" && pathname.startsWith("/api/blogs/userlikes/")) {
    verifyToken(req, res, () => countUserLikes(req, res));
  } else if (method === "GET" && pathname.startsWith("/api/blogs/")) {
    verifyToken(req, res, () => getSingleBlog(req, res));
  } else if (method === "POST" && pathname === "/api/blogs") {
    verifyToken(req, res, () => createBlog(req, res));
  } else if (method === "PUT" && pathname.startsWith("/api/blogs/")) {
    verifyToken(req, res, () => updateBlog(req, res));
  } else if (method === "DELETE" && pathname.startsWith("/api/blogs/")) {
    verifyToken(req, res, () => deleteBlog(req, res));
  } else if (method === "POST" && pathname.startsWith("/api/blogs/dislike/")) {
    verifyToken(req, res, () => dislike(req, res));
  } else if (method === "POST" && pathname.startsWith("/api/blogs/like/")) {
    verifyToken(req, res, () => like(req, res));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify("not found"));
  }
}
module.exports = blogRoutes;
