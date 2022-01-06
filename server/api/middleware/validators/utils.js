const { StatusCodes } = require("http-status-codes");

const useManyValidators = (...validators) => (req, res) => {
  return [...validators].every((validator) => validator(req, res));
}

const requiredField = (fieldName) => (req, res) => {
  const field = req?.params?.[fieldName] || req?.body?.[fieldName];

  if (!field) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: `${fieldName} field is required`
    }));
    return false;
  }

  return true;
}

const isOfType = (fieldName, type) => (req, res) => {
  const field = req?.params?.[fieldName] || req?.body?.[fieldName];
  if (!field) return true; // Use requiredField() to test if it's required

  if (typeof field !== type) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: `${fieldName} field must be a ${type}`
    }));
    return false;
  }

  return true;
}

module.exports = {
  useManyValidators,
  requiredField,
  isOfType,
}
