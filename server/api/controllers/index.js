const { register, ranking } = require("./players");
const { notify } = require("./game");
const { join, leave, update } = require("./matchmaking");

module.exports = {
  register,
  ranking,
  join,
  leave,
  notify,
  update
}
