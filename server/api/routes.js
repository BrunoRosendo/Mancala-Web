const controllers = require("./controllers");
const middleware = require("./middleware");
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
        middleware.auth.canRegisterOrLogin
      ]
    },

    '/ranking': {
      controller: controllers.ranking
    },

    '/join': {
      controller: controllers.join,
      middlewares: [
        validators.join,
        middleware.auth.isAuthenticated
      ]
    },

    '/leave': {
      controller: controllers.leave,
      middlewares: [
        validators.leave,
        middleware.auth.isAuthenticated,
        middleware.game.existingGame,
        middleware.game.userIsPlaying,
      ]
    }
  },
});
