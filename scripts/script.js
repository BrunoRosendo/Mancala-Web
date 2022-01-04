let game, user;

$("#instructions").style.display = "none";
$("#scoreboard").style.display = "none";
$("#concedeButton").style.display = "none";
$("#endGameButton").style.display = "none";
$("#auth #userInfo").style.display = "none";

const hideElem = (elem) => {
  $(elem).style.display = "none";
};

const toggleBlockElem = (elem) => {
  prevDisplay = $(elem).style.display;

  if (prevDisplay === "none") $(elem).style.display = "block";
  else hideElem(elem);
};

const toggleInstructions = () => toggleBlockElem("#instructions");
const toggleScoreboard = () => toggleBlockElem("#scoreboard");
const toggleConfig = () => toggleBlockElem("#configuration");

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
  toggleBlockElem("button[id=concedeButton]");
  toggleBlockElem("button[id=startButton]");
  toggleConfig();

  const gameElem = $("#game");
  gameElem.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });

  const playFirst = $("#playOrder").checked;
  const multiplayer = $("#multiplayer").checked;
  const aiLevel = $("#aiLevel").value;

  game.play(playFirst, multiplayer, aiLevel);
};

const endGame = () => {
  game.resetBoard();
  toggleBlockElem("button[id=startButton]");
  hideElem("button[id=concedeButton]");
  hideElem("button[id=endGameButton]");
  game.sendMessage(""); // send twice since we display the last 2 messages
  game.sendMessage("");
  toggleConfig();
};

const concede = () => {
  game.sendMessage("Player 1 conceded. Player 2 won!"); // For now only P1 can concede (singleplayer)
  toggleBlockElem("button[id=endGameButton]");
  hideElem("button[id=concedeButton]");
};

const load = () => {
  const initialHouses = numHousesInput.value;
  const initialSeeds = numSeedsInput.value;

  $("output[for=numHousesRange]").value = initialHouses;
  $("output[for=numSeedsRange]").value = initialSeeds;

  game = new Game(initialSeeds, initialHouses);
};

const register = () => {
  const usernameInput = $("#usernameInput");
  const passInput = $("#passwordInput");
  const username = usernameInput.value;
  const pass = passInput.value;
  // console.log(username, pass);

  usernameInput.value = "";
  passInput.value = "";

  fetch("http://twserver.alunos.dcc.fc.up.pt:8008/register", {
    method: "POST",
    body: JSON.stringify({
      nick: username,
      password: pass,
    }),
  })
    .then((data) => data.json())
    .then((res) => {
      if (res?.error) {
        console.log("Couldn't Log in!");
      } else {
        console.log("Logged in!");
        user = new User(username, pass);
        toggleBlockElem("#auth #authForm");
        toggleBlockElem("#auth #userInfo");
        $("#auth #userInfo #username").innerHTML = username;
      }
    });
};

load();

/*
TODO LIST:
- Atualizar score e mensagens enquanto se joga
- Dar reset a tudo quando acaba o jogo (depois de confirmar o vencedor, com um butao ou assim)
- Fazer os diferentes niveis de AI
- Estado do jogo
- Mudar a board para nao depender de vh
- Por delay nas jogadas do bot
*/
