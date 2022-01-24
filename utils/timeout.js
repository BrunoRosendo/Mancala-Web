const DEFAULT_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const timeouts = {};

const setGameTimeout = (game, func, duration = DEFAULT_TIMEOUT) => {
    const timeout = setTimeout(func, duration);
    timeouts[game] = timeout;
}

const clearGameTimeout = (game) => {
    clearTimeout(timeouts[game]);
    delete timeouts[game];
}

module.exports = {
    setGameTimeout,
    clearGameTimeout,
}
