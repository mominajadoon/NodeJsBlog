const User = require("../models/user");

// Signup function
exports.signupUser = async (req, res) => {
  // console.log(res);
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString(); // Convert Buffer to string
  });

  req.on("end", async () => {
    try {
      const { email, password } = JSON.parse(body);

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.end(JSON.stringify({ error: "User already exists" }));
        return (res.status = 400);
      }

      // Create a new user
      const newUser = new User({ email, password });
      await newUser.save();
      res.end(JSON.stringify("User created successfully"));
      res.status = 201;
    } catch (error) {
      console.error("Error signing up user:", error);
      res.end(JSON.stringify({ error: "Internal server error" }));
      res.status = 500;
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
      // Find the user by email and password
      const user = await User.findOne({ email, password });

      if (!user) {
        res.end(JSON.stringify("invalid email or password"));
        return (res.status = 401);
      }
      res.end(JSON.stringify("login successful"));
      res.status = 201;
    } catch (error) {
      console.error("Error logging in user:", error);
      res.end(JSON.stringify("Internal server error"));
      res.status = 500;
    }
  });
};
