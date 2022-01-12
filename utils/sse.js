const clients = {};

const addClient = (game, player, res) => {
  clients[game] = clients[game] || [];
  clients[game].push({ player, res });
}

const removeGame = (game) => {
  clients[game].forEach(c => {
    c.res.end();
  });

  delete clients[game];
}

const sendGameEvent = (game, data) => {
  clients[game].forEach(c => {
    sendEvent(c.res, data);
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
