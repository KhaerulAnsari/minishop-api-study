// Layer untuk handle request dan response
// Biasanya juga handle validasi body

const express = require("express");
const prisma = require("../db/index");
const { sendError, sendSuccess } = require("../utils/response");
const { authenticateToken } = require("../middleware/auth");
const {
  getAllProduct,
  getProductbyId,
  getProductsByUserId,
  createProduct,
  updateProduct,
  deleteProductById,
  replaceProductById,
} = require("./product.service");

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await getAllProduct();

  return sendSuccess(res, 200, "Products retrieved successfully", products);
});

// Get products by user ID (for logged-in user's own products)
router.get("/my-products", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const products = await getProductsByUserId(userId);

    return sendSuccess(res, 200, "Your products retrieved successfully", products);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

// Get products by specific user ID (admin or public access)
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const products = await getProductsByUserId(userId);

    return sendSuccess(res, 200, "User products retrieved successfully", products);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await getProductbyId(productId);

    return sendSuccess(res, 200, "Produk berhasil diambil", product);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const newProduct = req.body;
    const userId = parseInt(req.user.userId);

    const product = await createProduct(newProduct, userId);

    return sendSuccess(res, 201, "Create product success", product);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const newProduct = req.body;
    const productId = parseInt(req.params.id);
    const userId = parseInt(req.user.userId);
    const userRole = req.user.role;

    const product = await updateProduct(productId, newProduct, userId, userRole);

    return sendSuccess(res, 200, "Update product success", product);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const newProduct = req.body;
    const productId = parseInt(req.params.id);
    const userId = parseInt(req.user.userId);
    const userRole = req.user.role;

    const product = await replaceProductById(productId, newProduct, userId, userRole);

    return sendSuccess(res, 200, "Update product success", product);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const userId = parseInt(req.user.userId);
    const userRole = req.user.role;

    await deleteProductById(productId, userId, userRole);

    return sendSuccess(res, 200, "Product deleted successfully");
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

module.exports = router;
