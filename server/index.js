const config = require("./config/env");
const http = require("http");
const db = require("./loaders/db");

const server = http.createServer(async (req, res) => {
  res.write("Hello World\n");
  res.end();
});

server.listen(config.port, () => {
  console.log(`Server running on port: ${config.port}`);
});
