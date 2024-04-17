require("dotenv").config();

const express = require("express");
const { connectDatabase } = require("./config/db");

// routes
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

// express app
const app = express();

// Connect to the database
connectDatabase()
  .then((res) => app.listen(5000))
  .catch((err) => console.log(err));

// routes
app.get("/", (req, res) => {
  res.redirect("/api/blogs/");
});

// blog routes
app.use("/api/blogs", blogRoutes);

// user routes
app.use("/api/users", userRoutes);

// 404
app.use((req, res) => {
  res.status(404);
});
