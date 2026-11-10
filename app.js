const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const HTTPres = require("./utils/HTTPres");
exports.app = app;
const corsRouter = require("./routes/routsCorces");
const usersRouter = require("./routes/routsUsers");

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //> Serve static files from the "uploads" directory

const logger = (req, res, next) => {
  let date = new Date();
  console.log(`${date.toISOString()} - ${req.method} ${req.url}`);
  next();
}
app.use(logger);

app.use(cors());
app.use("/about", corsRouter);
app.use("/users", usersRouter);
app.use(express.static("./views")); //! get("/")

app.all("/{*splat}", (req, res) => {
  res.status(404).json({ status: HTTPres.FAIL, data: "Not Found" }); //! يكتب الرد بطريقة Jsend
})

app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.statusCode || 500).json({status: error.statusText || HTTPres.ERROR, MSG: error.message || "Internal Server Error", data: null}); //> Global error handler
});




module.exports = app;
