const controllers = require("./controllers");
const middleware = require("./middleware");
const validators = require("./middleware/validators");

module.exports = (method, endpoint) => {
  const route = routes[method]?.[endpoint];
  if (!route) {
    if (method !== 'GET') return {};
    return { controller: controllers.sendStaticResource };
  }

  return route;
}

const routes = Object.freeze({
  GET: {
    '/update': {
      controller: controllers.update,
      middlewares: [
        validators.update,
        middleware.game.existingGame,
        middleware.game.userIsPlaying,
      ]
    }
  },

  POST: {
    '/register': {
      controller: controllers.register,
      middlewares: [
        validators.register,
        middleware.auth.canRegisterOrLogin,
      ]
    },

    '/ranking': {
      controller: controllers.ranking
    },

    '/join': {
      controller: controllers.join,
      middlewares: [
        validators.join,
        middleware.auth.isAuthenticated,
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
    },

    '/notify': {
      controller: controllers.notify,
      middlewares: [
        validators.notify,
        middleware.auth.isAuthenticated,
        middleware.game.existingGame,
        middleware.game.userIsPlaying,
        middleware.game.onPlayerTurn,
        middleware.game.validMove,
      ]
    },
  },
});
