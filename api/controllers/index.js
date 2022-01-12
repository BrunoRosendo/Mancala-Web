const { register, ranking } = require("./players");
const { notify } = require("./game");
const { join, leave, update } = require("./matchmaking");
const { sendStaticResource } = require("./static");

module.exports = {
  register,
  ranking,
  join,
  leave,
  notify,
  update,
  sendStaticResource,
}
