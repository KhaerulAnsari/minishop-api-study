// Service Layer bertujuan untuk handle busines logic
// Reusable

const prisma = require("../db/index");
const path = require("path");
const {
  findProducts,
  findProductById,
  findProductsByUserId,
  insertProduct,
  deleteProduct,
  editProduct,
} = require("./product.repository");

// Helper function to transform images JSON string to array with full URLs
const transformProductImages = (product, req = null) => {
  if (!product) return product;

  // Handle single product
  if (product.images) {
    try {
      const imagePaths = JSON.parse(product.images);
      if (req) {
        // Add protocol and host to relative paths
        product.images = imagePaths.map(path => {
          if (path.startsWith('/uploads/')) {
            return `${req.protocol}://${req.get('host')}${path}`;
          }
          return path;
        });
      } else {
        product.images = imagePaths;
      }
    } catch (error) {
      console.error('Error parsing product images:', error);
      product.images = [];
    }
  } else {
    product.images = [];
  }

  // Also handle single image field
  if (product.image && req && product.image.startsWith('/uploads/')) {
    product.image = `${req.protocol}://${req.get('host')}${product.image}`;
  }

  return product;
};

// Helper function to transform multiple products
const transformProductsImages = (products, req = null) => {
  if (!products || !Array.isArray(products)) return products;

  return products.map(product => transformProductImages(product, req));
};

const getAllProduct = async (req = null) => {
  //   const products = await prisma.product.findMany();
  const products = await findProducts();

  return transformProductsImages(products, req);
};

const getProductbyId = async (id, req = null) => {
  if (typeof id !== "number") {
    throw Error("ID is not a number");
  }

  const product = await findProductById(id);

  if (!product) {
    throw Error("Product not found");
  }

  return transformProductImages(product, req);
};

const createProduct = async (productData, userId, imageFiles = null) => {
  if (!userId) {
    throw Error("User ID is required");
  }

  // Validate required fields
  if (!productData.name || !productData.description || !productData.price) {
    throw Error("Name, description, and price are required");
  }

  // Validate price is a valid number
  const price = parseInt(productData.price);
  if (isNaN(price) || price <= 0) {
    throw Error("Price must be a positive number");
  }

  // Process uploaded images
  let imagePaths = [];
  if (imageFiles && imageFiles.length > 0) {
    imagePaths = imageFiles.map(file => `/uploads/products/${file.filename}`);
  }

  const productWithUser = {
    ...productData,
    price: price, // Use validated price
    userId: userId,
    image: imagePaths.length > 0 ? imagePaths[0] : productData.image || '', // Main image
    images: imagePaths.length > 0 ? JSON.stringify(imagePaths) : null // All images as JSON
  };

  // Debug: Log the data being sent to repository
  console.log('Data being sent to insertProduct:', {
    ...productWithUser,
    images: productWithUser.images ? 'JSON string with ' + imagePaths.length + ' images' : null
  });

  const product = await insertProduct(productWithUser);

  // Transform images JSON string to array
  return transformProductImages(product);
};

const updateProduct = async (id, productData, userId, userRole, imageFiles = null) => {
  const existingProduct = await getProductbyId(id);

  // Check if user owns the product or is admin
  if (existingProduct.userId !== userId && userRole !== 'ADMIN') {
    throw Error("You can only edit your own products");
  }

  if (
    !(
      productData.name &&
      productData.description &&
      productData.price
    )
  ) {
    throw Error("Some fields is missing");
  }

  // Validate price if provided
  const price = parseInt(productData.price);
  if (isNaN(price) || price <= 0) {
    throw Error("Price must be a positive number");
  }

  // Handle image updates
  let updateData = {
    ...productData,
    price: price // Use validated price
  };

  if (imageFiles && imageFiles.length > 0) {
    // New images uploaded
    const imagePaths = imageFiles.map(file => `/uploads/products/${file.filename}`);
    updateData.image = imagePaths[0]; // Main image
    updateData.images = JSON.stringify(imagePaths); // All images

    // Store old images for potential rollback
    const oldImages = existingProduct.images ? JSON.parse(existingProduct.images) : [];

    try {
      // Try to update product first
      const product = await editProduct(id, updateData);

      // If update successful, delete old images
      if (oldImages.length > 0) {
        const { deleteImages } = require('../middleware/upload');
        deleteImages(oldImages);
        console.log('Successfully deleted old images after update');
      }

      return transformProductImages(product);
    } catch (error) {
      // If update fails, delete new uploaded images
      const { deleteImages } = require('../middleware/upload');
      deleteImages(imagePaths);
      console.log('Update failed, cleaned up new uploaded images');
      throw error;
    }
  } else if (productData.image) {
    // Keep existing main image or update with provided URL
    updateData.image = productData.image;
  }

  const product = await editProduct(id, updateData);
  return transformProductImages(product);
};

const replaceProductById = async (id, productData, userId, userRole) => {
  const existingProduct = await getProductbyId(id);

  // Check if user owns the product or is admin
  if (existingProduct.userId !== userId && userRole !== 'ADMIN') {
    throw Error("You can only edit your own products");
  }

  const product = await editProduct(id, productData);

  return product;
};

const deleteProductById = async (id, userId, userRole) => {
  const existingProduct = await getProductbyId(id); // check apakah product ada atau tidak

  // Check if user owns the product or is admin
  if (existingProduct.userId !== userId && userRole !== 'ADMIN') {
    throw Error("You can only delete your own products");
  }

  // Delete associated images before deleting product
  if (existingProduct.images) {
    const { deleteImages } = require('../middleware/upload');
    try {
      const imagePaths = JSON.parse(existingProduct.images);
      deleteImages(imagePaths);
    } catch (error) {
      console.error('Error deleting product images:', error);
    }
  }

  // Delete single image if exists and not in images array
  if (existingProduct.image && existingProduct.image.startsWith('/uploads/')) {
    const { deleteImage } = require('../middleware/upload');
    const fullPath = path.join(__dirname, '../../', existingProduct.image);
    deleteImage(fullPath);
  }

  await deleteProduct(id);
};

const getProductsByUserId = async (userId, req = null) => {
  if (typeof userId !== "number") {
    throw Error("User ID is not a number");
  }

  const products = await findProductsByUserId(userId);
  return transformProductsImages(products, req);
};

module.exports = {
  getAllProduct,
  getProductbyId,
  getProductsByUserId,
  createProduct,
  updateProduct,
  deleteProductById,
  replaceProductById,
};
