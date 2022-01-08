const { register, ranking } = require("./players");
const { notify } = require("./game");
const { join, leave } = require("./mathmaking");

module.exports = {
  register,
  ranking,
  join,
  leave,
  notify
}
