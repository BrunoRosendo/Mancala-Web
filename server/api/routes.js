const controllers = require("./controllers");
const middlewares = require("./middleware");
const validators = require("./middleware/validators");

module.exports = Object.freeze({
  GET: {
    '/': {
      controller: (req, res) => res.write("E que oh maninho"), 
    }
  },

  POST: {
    '/register': {
      controller: controllers.register,
      middlewares: [
        validators.register,
        middlewares.auth.register
      ]
    },


  },

  PUT: {

  },

  DELETE: {

  }
});
