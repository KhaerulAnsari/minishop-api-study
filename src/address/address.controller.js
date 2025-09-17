const express = require("express");
const { sendError, sendSuccess } = require("../utils/response");
const { authenticateToken } = require("../middleware/auth");
const {
  getAddressessByUserId,
  getAddressById,
  createAddress,
  updateAddress,
  removeAddress,
} = require("./address.service");

const app = express.Router();

app.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);

    const address = await getAddressessByUserId(userId);
    return sendSuccess(res, 200, "Addresses retrieved successfully", address);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

app.get("/:id", authenticateToken, async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const userId = parseInt(req.user.userId);

    const address = await getAddressById(addressId, userId);

    if (!address) {
      return sendError(res, 404, "Address not found");
    }

    return sendSuccess(res, 200, "Address retrieved successfully", address);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

app.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const addressData = req.body;

    const newAddress = await createAddress(addressData, userId);
    return sendSuccess(res, 201, "Address created successfully", newAddress);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

app.put("/:id", authenticateToken, async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const userId = parseInt(req.user.userId);
    const addressData = req.body;

    const updatedAddress = await updateAddress(userId, addressId, addressData);
    return sendSuccess(
      res,
      200,
      "Address updated successfully",
      updatedAddress
    );
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

app.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const userId = parseInt(req.user.userId);

    const deletedAddress = await removeAddress(userId, addressId);
    return sendSuccess(
      res,
      200,
      "Address deleted successfully",
      deletedAddress
    );
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

module.exports = app;
