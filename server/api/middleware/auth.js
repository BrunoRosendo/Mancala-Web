const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");

const canRegisterOrLogin = async (req, res) => {
  const db = await require("../../loaders/db");

  if (!await canRegister(req, db) && !await canLogin(req, db)) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "User registered with a different password"
    }));
    return false;
  }

  return true;
}

const isAuthenticated = async (req, res) => {
  const db = await require("../../loaders/db");

  if (!await canLogin(req, db)) {
    res.writeHead(StatusCodes.UNAUTHORIZED, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "The credentials provided are incorrect"
    }));
    return false;
  }

  return true;
}

const canRegister = async (req, db) => {
  const nick = req.body.nick || req.params.nick;
  const sql = "SELECT * from player where nick = ?";

  const player = await db.get(sql, [nick]);
  return !player;
}

const canLogin = async (req, db) => {
  const nick = req.body.nick || req.params.nick;
  const password = req.body.password || req.params.password;
  const hash = crypto.
    createHash('md5')
    .update(password)
    .digest('hex');

  const sql = "SELECT * from player where nick = ?";
  const player = await db.get(sql, [nick]);

  return nick === player.nick && hash === player.password;
}

module.exports = {
  canRegisterOrLogin,
  isAuthenticated
}
