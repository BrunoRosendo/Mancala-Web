const { useManyValidators, requiredField, isOfType, isGreaterThan } = require("./utils");

const register = useManyValidators(
  requiredField("nick", "body"),isOfType("nick", "string"),
  requiredField("password", "body"), isOfType("password", "string")
);

const join = useManyValidators(
  requiredField("nick", "body"), isOfType("nick", "string"),
  requiredField("password", "body"), isOfType("password", "string"),
  requiredField("size", "body"), isOfType("size", "number"), isGreaterThan("size", 0),
  requiredField("initial", "body"), isOfType("initial", "number"), isGreaterThan("initial", 0)
);

const leave = useManyValidators(
  requiredField("nick", "body"), isOfType("nick", "string"),
  requiredField("password", "body"), isOfType("password", "string"),
  requiredField("game", "body"), isOfType("game", "string")
);

const notify = useManyValidators(
  requiredField("nick", "body"), isOfType("nick", "string"),
  requiredField("password", "body"), isOfType("password", "string"),
  requiredField("game", "body"), isOfType("game", "string"),
  requiredField("move", "body"), isOfType("move", "number")
);

const update = useManyValidators(
  requiredField("nick", "params"), isOfType("nick", "string"),
  requiredField("game", "params"), isOfType("game", "string")
);

module.exports = {
  register,
  join,
  leave,
  notify,
  update,
}
