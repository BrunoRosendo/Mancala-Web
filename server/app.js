require("dotenv").config();
const http = require("http");
const PORT = process.env.PORT || 5000;

const db = require("./config/db").connect();

const server = http.createServer(async (req, res) => {
  res.write("Hello World\n");
  res.end();
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
