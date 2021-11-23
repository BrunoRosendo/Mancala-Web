const $ = (selector) => document.querySelector(selector);

$('#instructions').style.display = "none";
$('#classification').style.display = "none";

const hideElem = (elem) => {
  $(elem).style.display = "none";
}

const toggleBlockElem = (elem) => {
  prevDisplay = $(elem).style.display;

  if (prevDisplay === "none")
    $(elem).style.display = "block";
  else
    hideElem(elem);
}

const toggleInstructions = () => toggleBlockElem('#instructions');
const toggleRanking = () => toggleBlockElem('#classification');

const numHouses = $("input[name=numHousesRange]");
numHouses.addEventListener('change', () => {
  $('output[for=numHousesRange]').value = numHouses.value;
});

const numSeeds = $("input[name=numSeedsRange]");
numSeeds.addEventListener('change', () => {
  $('output[for=numSeedsRange]').value = numSeeds.value;
});
