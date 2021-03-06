const { StatusCodes } = require("http-status-codes");
const { sendGameEvent, removeGame } = require("../../utils/sse");
const { setGameTimeout, clearGameTimeout } = require("../../utils/timeout");

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

  // Clear last turn's timeout
  clearGameTimeout(game);

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

  const playerNum = nick === curGame.playerOne ? 1 : 2;
  const opponentNum = playerNum === 1 ? 2 : 1;

  const playAgain = turn(move, playerNum, board, curGame.numPits);
  const gameOver = checkGameEnd(playAgain ? playerNum : opponentNum, board, curGame.numPits);

  const newSideOne = {
    store: board[curGame.numPits],
    pits: board.slice(0, curGame.numPits)
  };

  const newSideTwo = {
    store: board[board.length - 1],
    pits: board.slice(curGame.numPits + 1, board.length - 1)
  };

  const opponent = opponentNum === 1 ?
    curGame.playerOne : curGame.playerTwo;
  const nextTurn = playAgain ? nick : opponent;

  const updateSql = `UPDATE game SET
    turn = ?,
    playerOneSide = ?,
    playerTwoSide = ?
    WHERE id = ?`;

  await db.run(updateSql, [
    nextTurn,
    JSON.stringify(newSideOne),
    JSON.stringify(newSideTwo),
    game
  ]);

  const updateMsg = { board: {
    sides: {},
    turn: nextTurn,
  }};
  updateMsg.board.sides[curGame.playerOne] = newSideOne;
  updateMsg.board.sides[curGame.playerTwo] = newSideTwo;

  if (gameOver) {
    const winner = await closeGame(
      curGame.playerOne,
      curGame.playerTwo,
      newSideOne.store,
      newSideTwo.store,
      game,
      db
    );

    updateMsg.winner = winner;
  }

  res.writeHead(StatusCodes.OK, { "Content-Type": "application/json" });
  res.write(JSON.stringify({}));
  res.end();

  sendGameEvent(game, JSON.stringify(updateMsg));
  if (gameOver) {
    removeGame(game);
    return;
  }

  // Set timeout for next player
  setGameTimeout(game, () => leaveOnTimeout(game, nick, opponent, db));
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

const checkGameEnd = (player, board, numPits) => {
  let offset = player === 1 ? 0 : numPits + 1;

  for (let i = offset; i < offset + numPits; ++i)
      if (board[i] > 0) return false;

  const storage = player === 1 ? board.length - 1 : numPits;
  offset = player === 1 ? numPits + 1 : 0;

  for (let i = offset; i < offset + numPits; ++i) {
    board[storage] += board[i];
    board[i] = 0;
  }

  return true;
}

const closeGame = async (playerOne, playerTwo, scoreOne, scoreTwo, game, db) => {
  const deleteSql = "DELETE FROM game WHERE id = ?";
  await db.run(deleteSql, [game]);

  if (scoreOne === scoreTwo) {
    await updateRanking(playerOne, false, db);
    await updateRanking(playerTwo, false, db);
    return null;
  }

  const [winner, loser] = scoreOne > scoreTwo ?
    [playerOne, playerTwo] : [playerTwo, playerOne];

  await updateRanking(winner, true, db);
  await updateRanking(loser, false, db);
  return winner;
}

const onPlayerHouse = (idx, player, numPits, board) => {
  return player === 1
    ? idx >= 0 && idx < numPits
    : idx > numPits && idx < board.length - 1;
}

const leaveOnTimeout = async (game, winner, loser, db) => {
  const deleteSql = "DELETE FROM game WHERE id = ?";
  await db.run(deleteSql, [game]);

  await updateRanking(winner, true, db);
  await updateRanking(loser, false, db);

  sendGameEvent(game, JSON.stringify({ winner }));
  removeGame(game);
}

module.exports = {
  notify,
  updateRanking
}
