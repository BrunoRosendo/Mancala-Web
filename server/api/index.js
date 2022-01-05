const routes = require("./routes");
const { getRequestBody, getUrlParams, getEndpoint } = require("../utils/parser");
const db = require("../loaders/db");

module.exports = async (req, res) => {
  try {
    const parsedRequest = {
      endpoint: getEndpoint(url),
      params: getUrlParams(url),
      body: getRequestBody(req),
      rawRequest: req,
    }

    
    
  } catch(err) {
    console.error("Error while processing request (ignoring)", err);
  }
}
