const bcrypt = require("bcrypt");
const User = require("../models/user");
const { MongoClient } = require("mongodb");
const { connectDatabase, getDatabase } = require("../config/db");

let collection;

// Connect to the database
connectDatabase()
  .then(() => {
    collection = getDatabase().collection("users");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

// const databaseUrl = process.env.MONGO_URL;
// const client = new MongoClient(databaseUrl);

// const database = client.db("Sblogs");
// const collection = database.collection("users");

// Signup function
exports.signupUser = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString(); // Convert Buffer to string
  });

  req.on("end", async () => {
    try {
      const { email, password } = JSON.parse(body);
      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "email and password are required" }));
        return;
      }

      // Check if the user already exists
      const existingUser = await collection.findOne({ email: email });

      if (existingUser) {
        res.end(JSON.stringify({ error: "User already exists" }));
        console.log("user is already registered");
        return (res.status = 400);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with hashed password
      const newUser = { email, password: hashedPassword };
      await collection.insertOne(newUser);

      res.end(
        JSON.stringify({
          message: "User created successfully",
        })
      );
    } catch (error) {
      console.error("Error signing up user:", error);
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
};

// Login function
exports.loginUser = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const { email, password } = JSON.parse(body);
      if (!title || !body) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and body are required" }));
        return;
      }

      // Find the user by email
      const user = await collection.findOne({ email });

      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid email or password" }));
        return;
      }

      // Compare hashed password
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid email or password" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Login successful" }));
    } catch (error) {
      console.error("Error logging in user:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    } finally {
      // Close MongoDB connection
      await client.close();
    }
  });
};

// const User = require("../models/user");
// const { MongoClient } = require("mongodb");

// const databaseUrl = process.env.MONGO_URL;
// const client = new MongoClient(databaseUrl);

// const database = client.db("Sblogs");
// const collection = database.collection("users");

// // Signup function
// exports.signupUser = async (req, res) => {
//   let body = "";

//   req.on("data", (chunk) => {
//     body += chunk.toString(); // Convert Buffer to string
//   });

//   req.on("end", async () => {
//     try {
//       const { email, password } = JSON.parse(body);

//       // Check if the user already exists
//       const existingUser = await collection.findOne({ email: email });

//       if (existingUser) {
//         res.end(JSON.stringify({ error: "User already exists" }));
//         console.log("user is already registered");
//         return (res.status = 400);
//       }

//       // Create a new user
//       const newUser = { email, password };
//       await collection.insertOne(newUser);

//       res.end(
//         JSON.stringify({
//           message: "User created successfully",
//         })
//       );
//     } catch (error) {
//       console.error("Error signing up user:", error);
//       res.end(JSON.stringify({ error: "Internal server error" }));
//     }
//   });
// };

// // Login function
// exports.loginUser = async (req, res) => {
//   let body = "";

//   req.on("data", (chunk) => {
//     body += chunk.toString();
//   });

//   req.on("end", async () => {
//     try {
//       const { email, password } = JSON.parse(body);

//       // Find the user by email and password
//       const user = await collection.findOne({ email, password });

//       if (!user) {
//         res.writeHead(401, { "Content-Type": "application/json" });
//         res.end(JSON.stringify({ error: "Invalid email or password" }));
//         return;
//       }

//       res.writeHead(200, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ message: "Login successful" }));
//     } catch (error) {
//       console.error("Error logging in user:", error);
//       res.writeHead(500, { "Content-Type": "application/json" });
//       res.end(JSON.stringify({ error: "Internal server error" }));
//     } finally {
//       // Close MongoDB connection
//       await client.close();
//     }
//   });
// };
