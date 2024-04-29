require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");
const { connectToDatabase } = require("./config/db");

// routes
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

// express app
const app = express();

// Connect to the database
connectToDatabase()
  .then((res) => app.listen(5000))
  .catch((err) => console.log(err));

// Parse JSON bodies
app.use(bodyParser.json());

// blog routes
app.use("/api/blogs", blogRoutes);

// user routes
app.use("/api/users", userRoutes);
// routes
app.get("/", (req, res) => {
  res.redirect("/api/blogs/");
});

// 404
app.use((req, res) => {
  res.status(404);
});
