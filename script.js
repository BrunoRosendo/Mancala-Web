const $ = (selector) => document.querySelector(selector);

$("#instructions").style.display = "none";
$("#scoreboard").style.display = "none";

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

const numHouses = $("input[name=numHousesRange]");
numHouses.addEventListener("change", () => {
  $("output[for=numHousesRange]").value = numHouses.value;
});

const numSeeds = $("input[name=numSeedsRange]");
numSeeds.addEventListener("change", () => {
  $("output[for=numSeedsRange]").value = numSeeds.value;
});

const startGame = () => {
  const concedeButton = $("button[id=concedeButton]");
  const startButton = $("button[id=startButton]");
  concedeButton.disabled = false;
  startButton.disabled = true;
  toggleConfig();
};

const concede = () => {
  const concedeButton = $("button[id=concedeButton]");
  const startButton = $("button[id=startButton]");
  concedeButton.disabled = true;
  startButton.disabled = false;
  toggleConfig();
};
