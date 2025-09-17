// Layer untuk handle request dan response
// Biasanya juga handle validasi body

const express = require("express");
const prisma = require("../db/index");
const { sendError, sendSuccess } = require("../utils/response");
const { authenticateToken } = require("../middleware/auth");
const { uploadProductImages, uploadSingleProductImage, handleUploadError } = require("../middleware/upload");
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
  const products = await getAllProduct(req);

  return sendSuccess(res, 200, "Products retrieved successfully", products);
});

// Get products by user ID (for logged-in user's own products)
router.get("/my-products", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const products = await getProductsByUserId(userId, req);

    return sendSuccess(res, 200, "Your products retrieved successfully", products);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

// Get products by specific user ID (admin or public access)
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const products = await getProductsByUserId(userId, req);

    return sendSuccess(res, 200, "User products retrieved successfully", products);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await getProductbyId(productId, req);

    return sendSuccess(res, 200, "Produk berhasil diambil", product);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

router.post("/", authenticateToken, (req, res) => {
  uploadProductImages(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    try {
      const newProduct = req.body;
      const userId = parseInt(req.user.userId);

      const product = await createProduct(newProduct, userId, req.files);

      return sendSuccess(res, 201, "Create product success", product);
    } catch (error) {
      // Cleanup uploaded files if product creation fails
      if (req.files && req.files.length > 0) {
        const { deleteImages } = require('../middleware/upload');
        const filePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        console.log('Product creation failed, cleaning up uploaded files:', filePaths);
        deleteImages(filePaths);
      }

      return sendError(res, 400, error.message);
    }
  });
});

router.put("/:id", authenticateToken, (req, res) => {
  uploadProductImages(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    try {
      const newProduct = req.body;
      const productId = parseInt(req.params.id);
      const userId = parseInt(req.user.userId);
      const userRole = req.user.role;

      const product = await updateProduct(productId, newProduct, userId, userRole, req.files);

      return sendSuccess(res, 200, "Update product success", product);
    } catch (error) {
      // Cleanup new uploaded files if update fails
      if (req.files && req.files.length > 0) {
        const { deleteImages } = require('../middleware/upload');
        const filePaths = req.files.map(file => `/uploads/products/${file.filename}`);
        console.log('Product update failed, cleaning up new uploaded files:', filePaths);
        deleteImages(filePaths);
      }

      return sendError(res, 400, error.message);
    }
  });
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
