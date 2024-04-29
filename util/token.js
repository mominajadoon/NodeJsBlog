const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(user) {
  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "7687681h",
    }
  );
  return token;
}
function verifyToken(req, res, next) {
  // Get token from authorization header
  const bearerToken = req.headers["authorization"];
  const token = bearerToken.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Missing token" });
    return;
  }
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(400).json({ message: "Invalid Token" });
      return;
    }

    req.user = decoded;
    next();
  });
}
module.exports = { generateToken, verifyToken };
