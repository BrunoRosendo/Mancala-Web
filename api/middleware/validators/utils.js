const { StatusCodes } = require("http-status-codes");

const useManyValidators = (...validators) => (req, res) => {
  return [...validators].every((validator) => validator(req, res));
}

const requiredField = (fieldName, place) => (req, res) => {
  const field = place ?
    req?.[place]?.[fieldName]
  :
    req?.params?.[fieldName] || req?.body?.[fieldName];

  if (field == null) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: `${fieldName} field is required`
    }));
    return false;
  }

  return true;
}

const isOfType = (fieldName, type) => (req, res) => {
  let field = req?.params?.[fieldName] || req?.body?.[fieldName];

  if (field == null) return true; // Use requiredField() to test if it's required
  if (type === "number") field = parseInt(field);

  if (typeof field !== type) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: `${fieldName} field must be a ${type}`
    }));
    return false;
  }

  return true;
}

const isGreaterThan = (fieldName, lowerBound) => (req, res) => {
  const num = req?.params?.[fieldName] || req?.body?.[fieldName];

  if (num <= lowerBound) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: `${fieldName} must be greater than ${lowerBound}`
    }));
    return false;
  }

  return true;
}

module.exports = {
  useManyValidators,
  requiredField,
  isOfType,
  isGreaterThan,
}
