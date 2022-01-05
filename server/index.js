const config = require("./config/env");
const http = require("http");
const handleRequest = require("./api");

const server = http.createServer(async (req, res) => {
  handleRequest(req, res);
  res.end();
});

server.listen(config.port, () => {
  console.log(`Server running on port: ${config.port}`);
});
