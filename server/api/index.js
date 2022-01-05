const { StatusCodes } = require("http-status-codes");
const routes = require("./routes");
const { getRequestBody, getUrlParams, getEndpoint } = require("../utils/parser");

module.exports = async (req, res) => {
  try {
    const parsedRequest = {
      endpoint: getEndpoint(req.url),
      params: getUrlParams(req.url),
      body: getRequestBody(req),
      rawRequest: req,
    }

    const { middlewares, controller } = routes[req.method][parsedRequest.endpoint] || {};

    if (!controller) {
      res.writeHead(StatusCodes.NOT_FOUND, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: `unknown ${res.method} request`
      }));
      return;
    }

    if (middlewares && !middlewares.every((mid) => mid(parsedRequest, res))) {
      res.end();
      return;
    }

    controller(parsedRequest, res);
    res.end();

  } catch(err) {
      console.error("Unexpected error while processing request", err);

      res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "unexpected error"
      }));
  }
}
