let game;

$('#instructions').style.display = "none";
$('#scoreboard').style.display = "none";
$('#concedeButton').style.display = "none";

const hideElem = (elem) => {
  $(elem).style.display = "none";
};

const toggleBlockElem = (elem) => {
  prevDisplay = $(elem).style.display;

  if (prevDisplay === "none")
    $(elem).style.display = "block";
  else
    hideElem(elem);
};

const toggleInstructions = () => toggleBlockElem("#instructions");
const toggleScoreboard = () => toggleBlockElem("#scoreboard");
const toggleConfig = () => toggleBlockElem("#configuration");

const numHousesInput = $("input[id=numHousesRange]");
numHousesInput.addEventListener('change', (e) => {
  const numHouses = e.target.value;
  $('output[for=numHousesRange]').value = numHouses;
  game.resetBoard(null, numHouses);
});

const numSeedsInput = $("input[id=numSeedsRange]");
numSeedsInput.addEventListener('change', (e) => {
  const numSeeds = e.target.value;
  $('output[for=numSeedsRange]').value = numSeeds;
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
  toggleBlockElem("button[id=concedeButton]");
  toggleConfig();
}

const concede = () => {
  endGame();
};

const load = () => {
  const initialHouses = numHousesInput.value;
  const initialSeeds = numSeedsInput.value;

  $('output[for=numHousesRange]').value = initialHouses;
  $('output[for=numSeedsRange]').value = initialSeeds;

  game = new Game(initialSeeds, initialHouses);
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
