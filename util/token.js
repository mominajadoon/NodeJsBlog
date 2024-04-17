const jwt = require("jsonwebtoken");
function generateToken(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}
function verifyToken(req, res, next) {
  // Get token from authorization header
  const token = req.headers["authorization"];

  if (!token) {
    res.end(JSON.stringify({ error: "Unauthorized: Missing token" }));
    res.status = 401;
    return;
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/json" });
      res.end(JSON.stringify({ message: "Invalid Token" }));
      return;
    }
    next();
  });
}
module.exports = { generateToken, verifyToken };
