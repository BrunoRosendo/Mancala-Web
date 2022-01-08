const { StatusCodes } = require("http-status-codes");

const existingGame = async (req, res) => {
  const db = await require("../../loaders/db");
  const id = req?.body?.game;

  const sql = "SELECT * FROM game WHERE id = ?";
  const game = await db.get(sql, [id]);

  if (!game) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "Not a valid game"
    }));
    return false;
  }

  return true;
}

const userIsPlaying = async (req, res) => {
  const db = await require("../../loaders/db");
  const { nick, game } = req?.body;

  const sql = "SELECT * FROM game WHERE id = ?";
  const curGame = await db.get(sql, [game]);

  if (curGame.playerOne !== nick && curGame.playerTwo !== nick) {
    res.writeHead(StatusCodes.FORBIDDEN, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "You are not playing in this game"
    }));
    return false;
  }

  return true;
}

module.exports = {
  existingGame,
  userIsPlaying,
}
