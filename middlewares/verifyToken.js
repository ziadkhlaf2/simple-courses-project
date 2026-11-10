const jwt = require("jsonwebtoken");
const HTTPres = require("../utils/HTTPres");
const appError = require("../utils/appError");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const currentUser = jwt.verify(token, process.env.JWT_SECRET);
    req.currentUser = currentUser; //! data of the user
    next();
  } catch (error) {
    return next(new appError("Invalid token", 401, HTTPres.FAIL));
  }
};

module.exports = verifyToken;