const { StatusCodes } = require("http-status-codes");
const routes = require("./routes");
const { getRequestBody, getUrlParams, getEndpoint } = require("../utils/parser");
const { asyncEvery } = require("../utils/algebra");

module.exports = async (req, res) => {
  try {
    const parsedRequest = {
      endpoint: getEndpoint(req.url),
      params: getUrlParams(req.url),
      body: await getRequestBody(req),
      rawRequest: req,
    }

    const eventRequest = parsedRequest.endpoint === '/update';
    const { middlewares, controller } = routes[req.method]?.[parsedRequest.endpoint] || {};

    if (!controller) {
      res.writeHead(StatusCodes.NOT_FOUND, { "Content-Type": "application/json" });
      res.write(JSON.stringify({
        error: `Unknown ${res.method} request`
      }));
      res.end();
      return;
    }

    if (middlewares && !await asyncEvery(middlewares)(parsedRequest, res)) {
      res.end();
      return;
    }

    if (!eventRequest)
      res.writeHead(StatusCodes.OK, { "Content-Type": "application/json" });

    await controller(parsedRequest, res);

    if (!eventRequest) res.end();

  } catch(err) {
      console.error("Unexpected error while processing request", err);

      res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
      res.write(JSON.stringify({
        error: "Unexpected error"
      }));
      res.end();
  }
}