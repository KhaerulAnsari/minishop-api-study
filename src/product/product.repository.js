// Berkomunikasi dengan database
// Boleh pake ORM, boleh pake RAW query
// Supaya apa? supaya klo mau ganti ganti ORM tingga ganti file ini aja

const prisma = require("../db/index");

const findProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return products;
};

const findProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return product;
};

const insertProduct = async (productData) => {
  const product = await prisma.product.create({
    data: {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
      userId: productData.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return product;
};

const deleteProduct = async (id) => {
  await prisma.product.delete({
    where: {
      id,
    },
  });
};

const editProduct = async (id, productData) => {
  const product = await prisma.product.update({
    where: {
      id,
    },
    data: {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return product;
};

const findProductsByUserId = async (userId) => {
  const products = await prisma.product.findMany({
    where: {
      userId: userId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return products;
};

module.exports = {
  findProducts,
  findProductById,
  findProductsByUserId,
  insertProduct,
  deleteProduct,
  editProduct,
};
