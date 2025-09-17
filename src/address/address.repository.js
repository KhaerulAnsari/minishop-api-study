const prisma = require("../db/index");

const findAddressesByUserId = async (userId) => {
  const addresses = await prisma.address.findMany({
    where: { userId: userId },
  });

  return addresses;
};

const findAddressById = async (id, userId) => {
  const address = await prisma.address.findUnique({
    where: {
      id: id,
      userId: userId,
    },
  });

  return address;
};

const insertAddress = async (addressData) => {
  const address = await prisma.address.create({
    data: {
      street: addressData.street,
      city: addressData.city,
      zipCode: addressData.zipCode,
      userId: addressData.userId,
    },
  });

  return address;
};

const deleteAddress = async (userId, id) => {
  // First check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: id,
      userId: userId,
    },
  });

  if (!existingAddress) {
    throw new Error("Address not found or you don't have permission to delete it");
  }

  // Then delete using only the id (unique identifier)
  const address = await prisma.address.delete({
    where: {
      id: id,
    },
  });

  return address;
};

const editAddress = async (userId, id, addressData) => {
  // Debug: Log the parameters to check what's being passed
  console.log('editAddress params:', { userId, id, addressData });

  // Validate parameters
  if (!id || typeof id !== 'number') {
    throw new Error(`Invalid id parameter: ${id}. Expected a number.`);
  }

  if (!userId || typeof userId !== 'number') {
    throw new Error(`Invalid userId parameter: ${userId}. Expected a number.`);
  }

  // First check if address exists and belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: id,
      userId: userId,
    },
  });

  if (!existingAddress) {
    throw new Error("Address not found or you don't have permission to update it");
  }

  // Then update using only the id (unique identifier)
  const address = await prisma.address.update({
    where: {
      id: id,
    },
    data: {
      street: addressData.street,
      city: addressData.city,
      zipCode: addressData.zipCode,
    },
  });

  return address;
};

module.exports = {
  findAddressesByUserId,
  findAddressById,
  insertAddress,
  deleteAddress,
  editAddress,
};
