require('dotenv').config();

const app = require('./app');
const connectDB = require('./data/db');
const HTTPres = require("./utils/HTTPres");
const port = process.env.PORT || 3000;



async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exitCode = 1;
});