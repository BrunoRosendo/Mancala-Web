const { useManyValidators, requiredField, isOfType } = require("./utils");

const register = useManyValidators(
  requiredField("nick"), isOfType("nick", "string"),
  requiredField("password"), isOfType("password", "string")
);

const join = useManyValidators(
  isOfType("group", "string"),
  requiredField("nick"), isOfType("nick", "string"),
  requiredField("password"), isOfType("password", "string"),
  requiredField("size"), isOfType("size", "number"),
  requiredField("initial"), isOfType("initial", "number")
);

const leave = useManyValidators(
  requiredField("nick"), isOfType("nick", "string"),
  requiredField("password"), isOfType("password", "string"),
  requiredField("game"), isOfType("game", "string")
);

const notify = useManyValidators(
  requiredField("nick"), isOfType("nick", "string"),
  requiredField("password"), isOfType("password", "string"),
  requiredField("game"), isOfType("game", "string"),
  requiredField("move"), isOfType("move", "number")
);

const update = useManyValidators(
  requiredField("nick"), isOfType("nick", "string"),
  requiredField("game"), isOfType("game", "string")
);

module.exports = {
  register,
  join,
  leave,
  notify,
  update,
}
