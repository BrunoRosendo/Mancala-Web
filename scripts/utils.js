const $ = (selector) => document.querySelector(selector);

const destroyChildren = (elem) => {
  while (elem.firstChild) elem.removeChild(elem.firstChild);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {*} winsIncrement 1 if won, 0 otherwise
 */
const updateLocalRank = (winsIncrement) => {
  if (typeof Storage != "undefined") {
    let localRank = JSON.parse(localStorage.getItem("score")) ?? {
      nick: "Singleplayer",
      victories: 0,
      games: 0,
    };

    localRank.victories += winsIncrement;
    localRank.games++;
    localStorage.setItem("score", JSON.stringify(localRank));
  }
};

const showSnackbar = (text) => {
  const snackbar = $("#snackbar");
  snackbar.innerHTML = text;
  snackbar.className = "show";

  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
    snackbar.innerHTML = "";
  }, 3000);
};
