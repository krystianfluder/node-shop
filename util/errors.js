const handleError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

exports.handleError = handleError;

exports.handleError500 = (message) => handleError(message, 500);
