const { register, ranking } = require("./players");
const { join, leave, notify } = require("./game");

module.exports = {
  register,
  ranking,
  join,
  leave,
  notify
}
