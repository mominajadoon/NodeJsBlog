const jwt = require("jsonwebtoken");
function generateToken(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
}
function verifyToken(req, res, next) {
  // Get token from authorization header
  const bearerToken = req.headers["authorization"];
  const token = bearerToken.split(" ")[1];
  // console.log(token);

  if (!token) {
    res.writeHead(401, { "Content-Type": "text/json" });
    res.end(JSON.stringify({ message: "Unauthorized: Missing token " }));
    return;
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.writeHead(400, { "Content-Type": "text/json" });
      res.end(JSON.stringify({ message: "Invalid Token" }));
      return;
    }
    req.user = decoded; // Attach decoded token (which contains user information) to request object
    next();
  });
}
module.exports = { generateToken, verifyToken };
