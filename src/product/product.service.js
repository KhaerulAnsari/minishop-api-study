// Service Layer bertujuan untuk handle busines logic
// Reusable

const prisma = require("../db/index");
const {
  findProducts,
  findProductById,
  findProductsByUserId,
  insertProduct,
  deleteProduct,
  editProduct,
} = require("./product.repository");

const getAllProduct = async () => {
  //   const products = await prisma.product.findMany();
  const products = await findProducts();

  return products;
};

const getProductbyId = async (id) => {
  if (typeof id !== "number") {
    throw Error("ID is not a number");
  }

  const product = await findProductById(id);

  if (!product) {
    throw Error("Product not found");
  }

  return product;
};

const createProduct = async (productData, userId) => {
  if (!userId) {
    throw Error("User ID is required");
  }

  const productWithUser = {
    ...productData,
    userId: userId
  };

  const product = await insertProduct(productWithUser);
  return product;
};

const updateProduct = async (id, productData, userId, userRole) => {
  const existingProduct = await getProductbyId(id);

  // Check if user owns the product or is admin
  if (existingProduct.userId !== userId && userRole !== 'ADMIN') {
    throw Error("You can only edit your own products");
  }

  if (
    !(
      productData.name &&
      productData.description &&
      productData.price &&
      productData.image
    )
  ) {
    throw Error("Some fields is missing");
  }

  const product = await editProduct(id, productData);

  return product;
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

  await deleteProduct(id);
};

const getProductsByUserId = async (userId) => {
  if (typeof userId !== "number") {
    throw Error("User ID is not a number");
  }

  const products = await findProductsByUserId(userId);
  return products;
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
