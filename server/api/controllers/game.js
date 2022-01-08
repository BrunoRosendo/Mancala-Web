const crypto = require("crypto");

const join = async (req, res) => {
  const db = await require("../../loaders/db");
  const { nick, size, initial } = req?.body;

  const currentSql = `SELECT * from game WHERE
    playerOne = ? OR
    playerTwo = ?`;

  const currentGame = await db.get(currentSql, [nick, nick]);
  if (currentGame) {
    res.write(JSON.stringify({ game: currentGame.id }));
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

  // TODO: Update players
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

  res.write(JSON.stringify({}));
  //TODO: Update player(s) of the winner
}

const updateRanking = async (nick, win, db) => {
  const rankSql = "SELECT * FROM ranking WHERE nick = ?";
  const currentRank = await db.get(rankSql, [nick]);
  const victoryIncrement = win ? 1 : 0

  if (!currentRank) {
    const createSql = `INSERT INTO ranking VALUES (?, ?, 1)`;
    await db.run(createSql, [nick, victoryIncrement]);
    return;
  }

  const updateSql = `UPDATE ranking SET
    victories = ?,
    games = ?
    WHERE nick = ?`;

  await db.run(updateSql, [
    currentRank.victories + victoryIncrement,
    currentRank.games + 1,
    nick
  ]);
}

const notify = async (req, res) => {
  const db = await require("../../loaders/db");
  const { nick, move, game } = req?.body;

  const getSql = "SELECT * FROM game WHERE id = ?";
  const curGame = await db.get(getSql, [game]);
  const [playerOneSide, playerTwoSide] = [
    JSON.parse(curGame.playerOneSide),
    JSON.parse(curGame.playerTwoSide)
  ];

  const board = playerOneSide.pits
    .concat([playerOneSide.store])
    .concat(playerTwoSide.pits)
    .concat([playerTwoSide.store]);

  const playAgain = turn(move, nick === curGame.playerOne ? 1 : 2, board, curGame.numPits);

  const newSideOne = JSON.stringify({
    store: board[curGame.numPits],
    pits: board.slice(0, curGame.numPits)
  });

  const newSideTwo = JSON.stringify({
    store: board[board.length - 1],
    pits: board.slice(curGame.numPits + 1, board.length - 1)
  });

  const opponent = nick === curGame.playerOne ?
    curGame.playerTwo : curGame.playerOne;

  const updateSql = `UPDATE game SET
    turn = ?,
    playerOneSide = ?,
    playerTwoSide = ?
    WHERE id = ?`;

  await db.run(updateSql, [
    playAgain ? nick : opponent,
    newSideOne,
    newSideTwo,
    game
  ]);

  res.write(JSON.stringify({}));
  // TODO: Check game end and update (winner as well)
}

const turn = (idx, player, board, numPits) => {
  if (player === 2) idx += numPits + 1;
    let numSeeds = board[idx];

    const [ownStorage, enemyStorage] =
      player === 1
        ? [numPits, board.length - 1]
        : [board.length - 1, numPits];

    board[idx] = 0;

    for (; numSeeds > 0; --numSeeds) {
      idx = ++idx % board.length;
      if (idx === enemyStorage) {
        ++numSeeds;
        continue;
      }

      board[idx]++;
    }

    if (idx === ownStorage) return true;
    if (!onPlayerHouse(idx, player, numPits, board) || board[idx] > 1)
      return false;

    const distFromMiddle = Math.abs(numPits - idx);
    const middleStorageIdx = numPits;
    const oppositeIdx =
      player === 1
        ? middleStorageIdx + distFromMiddle
        : middleStorageIdx - distFromMiddle;

    board[ownStorage] += board[oppositeIdx] + board[idx];
    board[oppositeIdx] = 0;
    board[idx] = 0;

    return false;
}

const onPlayerHouse = (idx, player, numPits, board) => {
  return player === 1
    ? idx >= 0 && idx < numPits
    : idx > numPits && idx < board.length - 1;
}

module.exports = {
  join,
  leave,
  notify,
}
