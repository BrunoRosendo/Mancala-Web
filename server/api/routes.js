const controllers = require("./controllers");
const middlewares = require("./middleware");
const validators = require("./middleware/validators");

module.exports = Object.freeze({
  GET: {
    '/user': {
      controller: (req, res) => res.write("E que oh maninho"), 
    }
  },

  POST: {
    '/register': {
      controller: (req, res) => res.write(JSON.stringify({ msg: "success" })),
      middlewares: [validators.register]
    }
  },

  PUT: {

  },

  DELETE: {

  }
});
