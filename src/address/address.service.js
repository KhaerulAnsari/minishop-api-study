const { user } = require("../db");
const {
  findAddressesByUserId,
  findAddressById,
  insertAddress,
  deleteAddress,
  editAddress,
} = require("./address.repository");

// Helper function to remove userId from response
const filterAddressResponse = (address) => {
  if (!address) return address;

  const { userId, ...addressWithoutUserId } = address;
  return addressWithoutUserId;
};

// Helper function to filter multiple addresses
const filterAddressesResponse = (addresses) => {
  if (!addresses || !Array.isArray(addresses)) return addresses;

  return addresses.map(address => filterAddressResponse(address));
};

const getAddressessByUserId = async (userId) => {
  const addresses = await findAddressesByUserId(userId);
  return filterAddressesResponse(addresses);
};

const getAddressById = async (id, userId) => {
  const address = await findAddressById(id, userId);
  if (!address) {
    throw Error("Address not found");
  }
  return filterAddressResponse(address);
};

const createAddress = async (addressData, userId) => {
  const addressDataWithUser = {
    ...addressData,
    userId: userId,
  };

  if (
    !addressDataWithUser.street ||
    !addressDataWithUser.city ||
    !addressDataWithUser.zipCode ||
    !addressDataWithUser.userId
  ) {

    throw Error("All fields are required");
  }

  const newAddress = await insertAddress(addressDataWithUser);
  return filterAddressResponse(newAddress);
};

const updateAddress = async (userId, id, addressData) => {
  if (typeof id !== "number") {
    throw Error("ID is not a number");
  }

  const updatedAddress = await editAddress(userId, id, addressData);
  return filterAddressResponse(updatedAddress);
};

const removeAddress = async (userId, id) => {
  if (typeof id !== "number") {
    throw Error("ID is not a number");
  }

  const deletedAddress = await deleteAddress(userId, id);
  return filterAddressResponse(deletedAddress);
};

module.exports = {
  getAddressessByUserId,
  getAddressById,
  createAddress,
  updateAddress,
  removeAddress,
};
