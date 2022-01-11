require("dotenv").config();

module.exports = Object.freeze({
  // App
  port: process.env.PORT || 5000,

  // Database
  db_host: process.env.DB_HOST || "localhost",
  db_port: process.env.DB_PORT || 27018,
  db_name: process.env.DB_NAME || "mancala-db",
  get db_url() {
    return process.env.DB_URL || `mongodb://${this.db_host}:${this.db_port}`;
  }
});
