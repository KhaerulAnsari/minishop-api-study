// Utility functions for handling API responses

const sendError = (res, status = 400, message = "Bad Request") => {
  return res.status(status).send({
    error: true,
    message: message
  });
};

const sendSuccess = (res, status = 200, message = "Success", data = null) => {
  const response = {
    error: false,
    message: message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(status).send(response);
};

module.exports = {
  sendError,
  sendSuccess
};