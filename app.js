require("dotenv").config({ quiet: true });
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT;
const userRoute = require("./routes/userRoute");
const categoryRoute = require("./routes/categoryRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const webhookRoute = require("./routes/webhook");
// connect to db first before running on port
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Connected to db`);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
app.use("/webhook", webhookRoute);
app.use(express.json());
app.use(cookieParser());
app.use("/api", userRoute);
app.use("/api", categoryRoute);
app.use("/api", productRoute);
app.use("/api", cartRoute);
app.use("/api", orderRoute);
app.use((error, req, res, next) => {
  return res
    .status(error.status || 500)
    .json({ message: error.message || "server error" });
});
