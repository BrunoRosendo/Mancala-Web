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

  game.play();
};

const concede = () => {
  toggleBlockElem("button[id=startButton]");
  toggleBlockElem("button[id=concedeButton]");
  toggleConfig();
};

const load = () => {
  const initialHouses = numHousesInput.value;
  const initialSeeds = numSeedsInput.value;

  $('output[for=numHousesRange]').value = initialHouses;
  $('output[for=numSeedsRange]').value = initialSeeds;

  game = new Game(initialHouses, initialSeeds);
};

load();
