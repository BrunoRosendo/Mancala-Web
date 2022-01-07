const controllers = require("./controllers");
const middlewares = require("./middleware");
const validators = require("./middleware/validators");

module.exports = Object.freeze({
  GET: {
    '/': {
      controller: (req, res) => res.write(JSON.stringify(req.params)), 
    }
  },

  POST: {
    '/register': {
      controller: controllers.register,
      middlewares: [
        validators.register,
        middlewares.auth.canRegisterOrLogin
      ]
    },

    '/ranking': {
      controller: controllers.ranking
    },

    '/join': {
      controller: controllers.join,
      middlewares: [
        validators.join,
        middlewares.auth.isAuthenticated
      ]
    },
  },

  PUT: {

  },

  DELETE: {

  }
});
