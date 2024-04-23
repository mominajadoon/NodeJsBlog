const express = require("express");
const { verifyToken } = require("../util/token");

const blogController = require("../controllers/blogController");
const {
  getAllBlogs,
  getSingleBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  like,
  dislike,
  countUserLikes,
} = blogController;

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:id", getSingleBlog);
router.post("/", verifyToken, createBlog);
router.put("/:id", verifyToken, updateBlog);
router.delete("/:id", verifyToken, deleteBlog);
router.post("/dislike/:blogId", verifyToken, dislike);
router.post("/like/:blogId", verifyToken, like);
router.get("/userlikes/:userId", verifyToken, countUserLikes);

module.exports = router;
