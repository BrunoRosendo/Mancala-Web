const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const { updateRanking } = require("./game");
const { addClient, sendGameEvent, removeGame } = require("../../utils/sse");

const join = async (req, res) => {
  res.writeHead(StatusCodes.OK, { "Content-Type": "application/json" });

  const db = await require("../../loaders/db");
  const { nick, size, initial } = req?.body;

  const currentSql = `SELECT * from game WHERE
    playerOne = ? OR
    playerTwo = ?`;

  const currentGame = await db.get(currentSql, [nick, nick]);
  if (currentGame) {
    res.write(JSON.stringify({ game: currentGame.id }));
    res.end();
    return;
  }

  const hash = crypto
    .createHash('md5')
    .update(Date.now().toString())
    .update(size.toString())
    .update(initial.toString())
    .digest('hex');

  const pendingSql = `SELECT * from game WHERE
    numPits= ?
    AND initialSeeds = ?
    AND isPending = 1`;

  let game = await db.get(pendingSql, [size, initial]);
  const playerSide = generatePlayerSide(size, initial);

  if (game) {
    const updateSql = `UPDATE game SET
      isPending = 0,
      playerTwo = ?,
      playerTwoSide = ?
      WHERE id = ?`;

    await db.run(updateSql, [
      nick, JSON.stringify(playerSide), game.id
    ]);

    res.write(JSON.stringify({ game: game.id }));
    res.end();

    const updateMsg = { board: {
      sides: {},
      turn: game.playerOne
    }};
    updateMsg["board"]["sides"][game.playerOne] = JSON.parse(game.playerOneSide);
    updateMsg["board"]["sides"][nick] = playerSide;

    sendGameEvent(game.id, JSON.stringify(updateMsg));
    return;
  }

  const createSql = `INSERT INTO game 
    (id, numPits, initialSeeds, playerOne, turn, playerOneSide)
    VALUES(?, ?, ?, ?, ?, ?)`;

  await db.run(createSql, [
    hash, size, initial, nick, nick, JSON.stringify(playerSide)
  ]);

  res.write(JSON.stringify({
    game: hash
  }));
  res.end();
}

const generatePlayerSide = (numPits, initialSeeds) => {
  return {
    store: 0,
    pits: Array(numPits).fill(initialSeeds)
  };
}

// TODO: Leave after timeout of 2 minutes
const leave = async (req, res) => {
  const db = await require("../../loaders/db");
  const { game, nick } = req?.body;

  const getSql = "SELECT * FROM game WHERE id = ?";
  const curGame = await db.get(getSql, [game]);
  const winner = curGame.isPending ? null :
    nick === curGame.playerOne ? curGame.playerTwo : curGame.playerOne;

  const deleteSql = "DELETE FROM game WHERE id = ?";
  await db.run(deleteSql, [game]);

  if (winner) {
    const loser = curGame.playerOne === winner ?
    curGame.playerTwo : curGame.playerOne;

    await updateRanking(winner, true, db);
    await updateRanking(loser, false, db);
  }

  res.writeHead(StatusCodes.OK, { "Content-Type": "application/json" });
  res.write(JSON.stringify({}));
  res.end();

  sendGameEvent(curGame.id, JSON.stringify({ winner }));
  removeGame(curGame.id);
}

const update = (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(StatusCodes.OK, headers);

  addClient(req?.params?.game, req?.params?.nick, res);
}

module.exports = {
  join,
  leave,
  update
}
