const crypto = require("crypto");

const join = async (req, res) => {
  const db = await require("../../loaders/db");
  const { nick, size, initial } = req?.body;

  const hash = crypto
    .createHash('md5')
    .update(Date.now().toString())
    .update(size.toString())
    .update(initial.toString())
    .digest('hex');

  const getSql = `SELECT * from game WHERE
    numPits= ?
    AND initialSeeds = ?`;

  let game = await db.get(getSql, [size, initial]);
  const playerSide = generatePlayerSide(size, initial);

  if (!game) {
    const createSql = `INSERT INTO game 
      (id, numPits, initialSeeds, playerOne, turn, playerOneSide)
      VALUES(?, ?, ?, ?, ?, ?)`;

    game = await db.run(createSql, [
      hash, size, initial, nick, nick, JSON.stringify(playerSide)
    ]);

  } else if (game.isPending == 1) {
    const updateSql = `UPDATE game SET
      isPending = 0,
      playerTwo = ?,
      playerTwoSide = ?
      WHERE id = ?`;

    await db.run(updateSql, [
      nick, JSON.stringify(playerSide), game.id
    ]);
  }

  res.write(JSON.stringify({
    game: game.id
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
