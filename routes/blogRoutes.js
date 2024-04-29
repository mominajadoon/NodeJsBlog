const express = require("express");
const upload = require("../util/multer");
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
  getLikedBlogsByUser,
} = blogController;

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:id", getSingleBlog);
router.post("/", verifyToken, upload.single("image"), createBlog);
router.put("/:id", verifyToken, upload.single("image"), updateBlog);
router.delete("/:id", verifyToken, deleteBlog);
router.post("/:blogId/dislike", verifyToken, dislike);
router.post("/:blogId/like", verifyToken, like);
router.get("/:userId/userlikes", verifyToken, getLikedBlogsByUser);

module.exports = router;
