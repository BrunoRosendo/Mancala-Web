const { useManyValidators, requiredField, isOfType } = require("./utils");

const register = useManyValidators(
  requiredField("nick"),
  isOfType("nick", "string"),
  requiredField("password"),
  isOfType("password", "string")
);

module.exports = {
  register,
}
