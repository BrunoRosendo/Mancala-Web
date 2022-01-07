let game, multiplayerController;

const hideElem = (elem) => (elem.style.display = "none");
const showBlockElem = (elem) => (elem.style.display = "block");

const toggleBlockElem = (elem) => {
  prevDisplay = elem.style.display;

  if (prevDisplay === "none") elem.style.display = "block";
  else hideElem(elem);
};

hideElem($("#instructions"));
hideElem($("#scoreboard"));
hideElem($("#concedeButton"));
hideElem($("#endGameButton"));
hideElem($("#auth #userInfo"));
hideElem($("#loading"));

const toggleInstructions = () => toggleBlockElem($("#instructions"));
const toggleScoreboard = () => toggleBlockElem($("#scoreboard"));
const toggleConfig = () => toggleBlockElem($("#configuration"));

const numHousesInput = $("input[id=numHousesRange]");
numHousesInput.addEventListener("change", (e) => {
  const numHouses = e.target.value;
  $("output[for=numHousesRange]").value = numHouses;
  game.resetBoard(null, numHouses);
});

const numSeedsInput = $("input[id=numSeedsRange]");
numSeedsInput.addEventListener("change", (e) => {
  const numSeeds = e.target.value;
  $("output[for=numSeedsRange]").value = numSeeds;
  game.resetBoard(numSeeds);
});

const startGame = () => {
  const playFirst = $("#playOrder").checked;
  const multiplayer = $("#multiplayer").checked;
  const aiLevel = $("#aiLevel").value;

  const concedeButton = $("button[id=concedeButton]");
  if (multiplayer) {
    if (!multiplayerController.isLoggedIn()) {
      alert("You need to log in to play Multiplayer!");
      return;
    }
    concedeButton.innerText = "Leave Queue";
  }
  toggleBlockElem(concedeButton);
  toggleBlockElem($("button[id=startButton]"));
  toggleConfig();

  const gameElem = $("#game");
  gameElem.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });

  game.play(playFirst, multiplayer, aiLevel);
};

const endGame = () => {
  game.resetBoard();
  toggleBlockElem($("button[id=startButton]"));

  const concedeButton = $("button[id=concedeButton]");
  hideElem(concedeButton);
  concedeButton.innerText = "Concede";
  hideElem($("button[id=endGameButton]"));
  game.sendMessage(""); // send twice since we display the last 2 messages
  game.sendMessage("");
  toggleConfig();
  $("#headerContainer").scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
};

const concede = async () => await game.concede();

const load = () => {
  const initialHouses = numHousesInput.value;
  const initialSeeds = numSeedsInput.value;

  $("output[for=numHousesRange]").value = initialHouses;
  $("output[for=numSeedsRange]").value = initialSeeds;

  game = new Game(initialSeeds, initialHouses);
  multiplayerController = new Multiplayer();
};

/**
 * Currently it doesn't save credentials because most browsers only ask to save if the page redirects
 */
const register = () => {
  const usernameInput = $("#usernameInput");
  const passInput = $("#passwordInput");
  const username = usernameInput.value;
  const pass = passInput.value;

  usernameInput.value = "";
  passInput.value = "";

  multiplayerController.register(username, pass).then((res) => {
    if (res > 0) {
      toggleBlockElem($("#auth #authForm"));
      toggleBlockElem($("#auth #userInfo"));
      $("#auth #userInfo #username").innerHTML = username;
    } else {
      // SHOW failed login
    }
  });
};

/**
 * Logs out of current user
 */
const logout = async () => {
  $("#usernameInput").value = "";
  $("#passwordInput").value = "";

  // If there's an active multiplayer game
  if (multiplayerController.isPlaying()) {
    console.log("Leaving Multiplayer Game...");
    await concede();
    $("#game").scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  } else if (multiplayerController.isSearching()) {
    console.log("Leaving Queue...");
    await concede();
  }

  multiplayerController.logout();
  console.log("Logged out.");

  toggleBlockElem($("#auth #authForm"));
  toggleBlockElem($("#auth #userInfo"));
  $("#auth #userInfo #username").innerHTML = "";
};

handleScoreboard = async () => {
  // GET server Rankings
  const rankingData = await multiplayerController.ranking();

  // Get Local Ranking
  let localRank = null;
  if (typeof Storage != "undefined") {
    localRank = JSON.parse(localStorage.getItem("score"));
  }

  // console.log("rankingData:", rankingData);
  const table = $("#scoreBody");
  destroyChildren(table);

  if (localRank != null) {
    const row = table.insertRow();
    row.classList.add("singleplayerRow");
    const nameCell = row.insertCell();
    const victoriesCell = row.insertCell();
    const numGamesCel = row.insertCell();
    nameCell.appendChild(document.createTextNode(localRank.nick));
    victoriesCell.appendChild(document.createTextNode(localRank.victories));
    numGamesCel.appendChild(document.createTextNode(localRank.games));
  }

  for (const rank of rankingData.ranking) {
    // console.log(rank);
    const row = table.insertRow();
    const nameCell = row.insertCell();
    const victoriesCell = row.insertCell();
    const numGamesCel = row.insertCell();
    nameCell.appendChild(document.createTextNode(rank.nick));
    victoriesCell.appendChild(document.createTextNode(rank.victories));
    numGamesCel.appendChild(document.createTextNode(rank.games));
  }

  toggleScoreboard();
};

load();
