const clients = {};

const addClient = (game, player, res) => {
  clients[game] = clients[game] || [];
  clients[game].push({ player, res });
}

const removeGame = (game) => {
  clients[game].forEach((p, res) => {
    res.end();
  });

  delete clients[game];
}

const sendGameEvent = (game, data) => {
  clients[game].forEach((p, res) => {
    sendEvent(res, data);
  });
}

const sendEvent = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

module.exports = {
  addClient,
  removeGame,
  sendGameEvent,
}
