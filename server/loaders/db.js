const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const config = require("../config/env");

let db;

const loadDB = async () => {
  if (!db) {
    try {
      db = await open({
        filename: `./loaders/${config.db_name}.db`,
        driver: sqlite3.Database
      });
      await createTables();

    } catch (err) {
      console.error("Failed in connecting to sqlite database (aborting)", err);
      process.exit(1);
    }

    console.log("Successfully connected to sqlite database");
  }
  return db;
}

const createTables = async () => {
  await db.exec(`CREATE TABLE IF NOT EXISTS player(
    nick TEXT PRIMARY KEY,
    password TEXT NOT NULL)`
  );

  /*
    We always need the whole player's side so it's not worth it
    to separate between storage and pits. It's saved as JSON
  */
  await db.exec(`CREATE TABLE IF NOT EXISTS game(
    id TEXT PRIMARY KEY,
    playerOne TEXT NOT NULL,
    playerTwo TEXT NOT NULL,
    turn TEXT,
    playerOneSide TEXT
    playerTwoSide TEXT)`
  );

  await db.exec(`CREATE TABLE IF NOT EXISTS ranking(
    nick TEXT PRIMARY KEY,
    victories INTEGER DEFAULT 0,
    games INTEGER DEFAULT 0)`
  );
}

module.exports = loadDB();
