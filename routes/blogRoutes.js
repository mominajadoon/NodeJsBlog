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
router.post("/create", verifyToken, createBlog);
router.put("/update/:id", verifyToken, updateBlog);
router.delete("/delete/:id", verifyToken, deleteBlog);
router.post("/dislike/:userId/:blogId", verifyToken, dislike);
router.post("/like/:userId/:blogId", verifyToken, like);
router.get("/userlikes/:userId", verifyToken, countUserLikes);

module.exports = router;
