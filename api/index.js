const { StatusCodes } = require("http-status-codes");
const router = require("./router");
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

    const { middlewares, controller } = router(req.method, parsedRequest.endpoint);

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

    await controller(parsedRequest, res);
    // res is closed on the controller

  } catch(err) {
      console.error("Unexpected error while processing request", err);

      res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
      res.write(JSON.stringify({
        error: "Unexpected error"
      }));
      res.end();
  }
}
