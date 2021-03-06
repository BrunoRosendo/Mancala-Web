const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");

const register = async (req, res) => {
  res.writeHead(StatusCodes.OK, { "Content-Type": "application/json" });

  const db = await require("../../loaders/db");

  const nick = req.body.nick || req.params.nick;
  const getSql = "SELECT * from player where nick = ?";
  const player = await db.get(getSql, [nick]);

  if (player) {
    res.write(JSON.stringify({}));
    res.end();
    return;
  }

  const password = req.body.password || req.params.password;
  const hash = crypto
    .createHash('md5')
    .update(password)
    .digest('hex');

  const insertSql = "INSERT INTO player VALUES (?, ?)";
  await db.run(insertSql, [nick, hash]);

  res.write(JSON.stringify({}));
  res.end();
}

const ranking = async (req, res) => {
  const db = await require("../../loaders/db");

  const sql = `
    SELECT * FROM ranking
    ORDER BY victories DESC
    LIMIT 10`;

  const table = await db.all(sql);

  res.writeHead(StatusCodes.OK, { "Content-Type": "application/json" });
  res.write(JSON.stringify({
    "ranking": table
  }));
  res.end();
}

module.exports = {
  register,
  ranking,
}
