const clients = {};
const queue = {}; // Events saved for when both players join

const addClient = (game, player, res) => {
  clients[game] = clients[game] || [];
  clients[game].push({ player, res });

  if (queue[game] && clients[game].length > 1) {
    queue[game].forEach(data => sendGameEvent(game, data));
    delete queue[game];
  }
}

const removeGame = (game) => {
  delete clients[game];
  delete queue[game];
}

const sendGameEvent = (game, data, force = false) => {

  // Queue event
  if (!clients[game] || (clients[game].length < 2 && !force)) {
    queue[game] = queue[game] || [];
    queue[game].push(data);
    return;
  }

  clients[game].forEach(c => {
    sendEvent(c.res, data);
  });
}

const sendEvent = (res, data) => {
  res.write(`data: ${data}\n\n`);
}

module.exports = {
  addClient,
  removeGame,
  sendGameEvent,
}
