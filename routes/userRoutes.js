const userController = require("../controllers/userController");
const { signupUser, loginUser } = userController;
const URL = require("url");

function userRoutes(req, res) {
  const { method, url } = req;
  const { pathname } = URL.parse(url);

  console.log("Request pathname:", pathname);

  if (method === "POST" && pathname === "/api/users/signup") {
    signupUser(req, res);
  } else if (method === "POST" && pathname === "/api/users/login") {
    loginUser(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify("not found"));
  }
}

module.exports = userRoutes;
