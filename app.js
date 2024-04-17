require("dotenv").config();
const http = require("http");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const { connectDatabase } = require("./config/db");

// routes
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
async function startServer() {
  try {
    // Connect to the database
    await connectDatabase();

    // starting the HTTP Server
    app.listen(5000, () => {
      console.log("Server is listening on port 5000");
    });
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
    process.exit(1);
  }
}
// Middleware function to verify JWT token

startServer();
