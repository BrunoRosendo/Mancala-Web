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

module.exports = {
  join,
}
