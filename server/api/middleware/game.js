const { StatusCodes } = require("http-status-codes");

const existingGame = async (req, res) => {
  const db = await require("../../loaders/db");
  const id = req?.body?.game || req?.params?.game;

  const sql = "SELECT * FROM game WHERE id = ?";
  const game = await db.get(sql, [id]);

  if (!game) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "Invalid game reference"
    }));
    return false;
  }

  return true;
}

const userIsPlaying = async (req, res) => {
  const db = await require("../../loaders/db");
  const nick = req?.body?.nick || req?.params?.nick;
  const game = req?.body?.game || req?.params?.game;

  const sql = "SELECT * FROM game WHERE id = ?";
  const curGame = await db.get(sql, [game]);

  if (curGame.playerOne !== nick && curGame.playerTwo !== nick) {
    res.writeHead(StatusCodes.FORBIDDEN, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "The user is not playing in this game"
    }));
    return false;
  }

  return true;
}

const onPlayerTurn = async (req, res) => {
  const db = await require("../../loaders/db");
  const { nick, game } = req?.body;

  const sql = "SELECT * FROM game WHERE id = ?";
  const curGame = await db.get(sql, [game]);

  if (curGame.turn !== nick) {
    res.writeHead(StatusCodes.FORBIDDEN, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "Not the user's turn"
    }));
    return false;
  }

  return true;
}

const validMove = async (req, res) => {
  const db = await require("../../loaders/db");
  const { nick, move, game } = req?.body;

  const sql = "SELECT * FROM game WHERE id = ?";
  const curGame = await db.get(sql, [game]);
  const side = JSON.parse(
    nick === curGame.playerOne ?
      curGame.playerOneSide
      :
      curGame.playerTwoSide
  );

  if (move < 0 || move > side.pits.length - 1) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: `Not a valid move. Choose a pit between 0 and ${side.pits.length - 1}`
    }));
    return false;
  }

  if (side.pits[move] <= 0) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: `Not a valid move. The pit is empty`
    }));
    return false;
  }

  return true;
}

module.exports = {
  existingGame,
  userIsPlaying,
  onPlayerTurn,
  validMove
}
