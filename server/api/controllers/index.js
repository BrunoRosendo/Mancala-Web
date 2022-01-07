const crypto = require("crypto");

const register = async (req, res) => {
  const db = await require("../../loaders/db");

  const nick = req.body.nick || req.params.nick;
  const getSql = "SELECT * from player where nick = ?";
  const player = await db.get(getSql, [nick]);

  if (player) {
    res.write(JSON.stringify({}));
    return;
  }

  const password = req.body.password || req.params.password;
  const hash = crypto.
    createHash('md5')
    .update(password)
    .digest('hex');

  const insertSql = "INSERT INTO player VALUES (?, ?)";
  await db.run(insertSql, [nick, hash]);
  res.write(JSON.stringify({}));
}

module.exports = {
  register,
}
