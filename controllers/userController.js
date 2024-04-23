const User = require("../models/user");
const { generateToken } = require("../util/token");

// Signup function
exports.signupUser = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      let jsonData;
      try {
        jsonData = JSON.parse(body);
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
        return;
      }
      const parsedBody = JSON.parse(body);
      const { email, password } = parsedBody;
      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Email and password are required" }));
        return;
      }

      // Check if the user already exists
      const existingUser = await User.findUserByEmail(email);

      if (existingUser) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User is already registered" }));
        return;
      }
      const token = generateToken(parsedBody);
      // res.setHeader("Authorization", token);
      await User.signupUser(email, password);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "User created successfully",
          token,
          data: { email, password },
        })
      );
      return;
    } catch (error) {
      console.error("Error signing up user:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
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
      let jsonData;
      try {
        jsonData = JSON.parse(body);
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
        return;
      }
      const parsedBody = JSON.parse(body);
      const { email, password } = parsedBody;
      if (!email || !password) {
        // Check for email and password, not title and body
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Email and password are required" }));
        return;
      }

      // Call the loginUser function from the model
      const token = generateToken(parsedBody);
      res.setHeader("Authorization", token);
      await User.loginUser(email, password);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Login successful",
          token,
          data: { email, password },
        })
      );
      return;
    } catch (error) {
      console.error("Error logging in user:", error);
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid email or password" }));
    }
  });
};
