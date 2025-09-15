const express = require("express");

const app = express();
const dotenv = require("dotenv");
const productController = require("./product/product.controller.js");
const userController = require("./user/user.controller.js");

dotenv.config();

app.use(express.json());

const PORT = process.env.PORT;

app.get("/api", (req, res) => {
  res.send("Hello World Express Prisma with Authentication");
});

app.use("/api/products", productController);
app.use("/api/users", userController);

app.listen(PORT, () => {
  console.log(`Server running in port : ${PORT}`);
});
