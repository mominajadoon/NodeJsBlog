const http = require("http");
require("dotenv").config();
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = http.createServer((req, res) => {
  // Route handling
  if (req.url.startsWith("/api/users")) {
    userRoutes(req, res);
  } else if (req.url.startsWith("/api/blogs")) {
    blogRoutes(req, res);
  } else {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end("internal server error");
  }
});

const databaseUrl = process.env.MONGO_URL;

mongoose
  .connect(databaseUrl)
  .then(() => {
    app.listen(3000, "localhost", () => {
      console.log("Server is listening on port 3000");
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
