const { StatusCodes } = require("http-status-codes");
const db = require("../../loaders/db");

const register = async (req, res) => {
  if (!await canRegister(req) && !await canLogin(req)) {
    res.writeHead(StatusCodes.BAD_REQUEST, { "Content-Type": "application/json" });
    res.write(JSON.stringify({
      error: "User registered with a different password"
    }));
    return false;
  }

  return true;
}

const canRegister = async (req) => {

}

const canLogin = async (req) => {

}

module.exports = {
  register,
}

