const { signupUser, loginUser } = require("../controllers/userController");
const URL = require("url");

module.exports = function (req, res) {
  const { method, url } = req;
  const { pathname } = URL.parse(url);
  if (method === "POST" && pathname.endsWith("/signup")) {
    signupUser(req, res);
  } else if (method === "POST" && pathname.endsWith("/login")) {
    loginUser(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify("not found"));
  }
};
