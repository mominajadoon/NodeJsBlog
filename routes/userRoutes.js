const express = require("express");

const userController = require("../controllers/userController");
const { signupUser, loginUser } = userController;

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);

module.exports = router;
