class Game {
  constructor(seedRange, houseRange) {
    this.boardController = new Gameboard("#gameboard", seedRange, houseRange);
  }

  play(playFirst, multiplayer, aiLevel) {
    this.currentPlayer = playFirst ? 1 : 2;
    this.multiplayer = multiplayer;
    this.aiLevel = aiLevel;

    if (playFirst) this.enablePlay();
    else this.aiTurn();
  }

  aiTurn() {
    let houseIdx;
    switch (this.aiLevel) {
      case 'easy':
        houseIdx = this.aiEasyTurn();
        break;
      case 'medium':
        houseIdx = this.aiMediumTurn();
        break;
      case 'hard':
        houseIdx = this.aiHardTurn();
        break;
      default:
        console.log("Invalid AI Level");
    }

    const oldBoard = this.boardController.copy();

    const playAgain = this.boardController.turn(houseIdx, 2);
    this.boardController.updateSeeds(oldBoard);

    const newScore = this.boardController.getScore(2);
    const scoreDiff = newScore - oldScore;
    this.sendMessage(
      `The Opponent scored ${scoreDiff} ${
        scoreDiff != 1 ? "points" : "point"
      } this round!`
    );

    this.updateScores(2);

    if (playAgain) {
      if (this.isGameOver()) this.declareWinner();
      else this.aiTurn();
      return; // Need to return here to avoid executing the next lines twice
    }

    this.currentPlayer = 1;
    if (this.isGameOver()) this.declareWinner();
    else this.enablePlay();
  }

  /**
   * Chooses a random not empty house
   */
  aiEasyTurn() {
    const possiblePlays = this.boardController.getPossiblePlays(2);

    const choice = Math.floor(
      Math.random() * possiblePlays.length
    );
  
    return possiblePlays[choice];
  }

  /**
   * Select a house that lets him play again
   * If there are none, chooses randomly
   */
  aiMediumTurn() {
    const possiblePlays = this.boardController.getPossiblePlays(2);
    const currentBoard = this.boardController.copy();

    for (let play of possiblePlays) {
      if (this.boardController.turn(play, 2, currentBoard))
        return play;
    }

    const randomChoice = Math.floor(
      Math.random() * possiblePlays.length
    );
    return possiblePlays[randomChoice];
  }

  /**
   * Select a house that lets him play again
   * If there are none, chooses the house which gives him the most points
   * Prioritizes a turn which gives no chance of playing to the other player
   */
  aiHardTurn() {
    const possiblePlays = this.boardController.getPossiblePlays(2);
    const board = this.boardController.copy();
    const currentScore = this.boardController.getScore(2, board);

    let replayable = false;
    let max = 0, chosen = possiblePlays[0];

    for (let play of possiblePlays) {
      const playAgain = this.boardController.turn(play, 2, board);

      if (this.boardController.isPlayerBoardEmpty(1))
        return play;

      const scoreDiff = this.boardController.getScore(board) - currentScore;

      if (playAgain && !replayable) {
        replayable = true;
        max = scoreDiff;
        chosen = play;
        continue;
      }

      if (!playAgain && replayable) continue;

      if (scoreDiff > max) {
        max = scoreDiff;
        chosen = play;
      }
    }

    return chosen;
  }

  playerTurn(houseIdx) {
    const oldBoard = this.boardController.copy();
    const oldScore = this.boardController.getScore(1);

    const playAgain = this.boardController.turn(houseIdx, 1);
    this.boardController.updateSeeds(oldBoard);

    const newScore = this.boardController.getScore(1);
    const scoreDiff = newScore - oldScore;
    this.sendMessage(
      `You scored ${scoreDiff} ${
        scoreDiff != 1 ? "points" : "point"
      } this round!`
    );

    this.updateScores(1);

    this.disablePlay();

    if (playAgain) {
      if (this.isGameOver()) this.declareWinner();
      else this.enablePlay(); // Playable seeds must be updated
      return;
    }

    this.currentPlayer = 2;
    if (this.isGameOver()) this.declareWinner();
    else this.aiTurn();
  }

  isGameOver() {
    return this.boardController.isPlayerBoardEmpty(this.currentPlayer);
  }

  declareWinner() {
    const oldBoard = this.boardController.copy();
    this.boardController.collectAllSeeds(this.currentPlayer === 1 ? 2 : 1);
    this.boardController.updateSeeds(oldBoard);
    this.updateScores(1);
    this.updateScores(2);
    const playerOneScore = this.boardController.getScore(1);
    const playerTwoScore = this.boardController.getScore(2);

    if (playerOneScore > playerTwoScore) this.sendMessage("Player 1 won!");
    else if (playerTwoScore > playerOneScore) this.sendMessage("Player 2 won!");
    else this.sendMessage("It's a tie!");

    toggleBlockElem("button[id=endGameButton]");
    hideElem("button[id=concedeButton]");
  }

  enablePlay() {
    const playerOneHouses = $("#gameboard").lastChild.children;
    for (let i = 0; i < playerOneHouses.length; ++i) {
      if (playerOneHouses[i].children.length === 0) continue;
      playerOneHouses[i].onclick = () => this.playerTurn(i);
      playerOneHouses[i].className = "house onHover";
    }
    this.sendMessage("It's your turn!");
  }

  disablePlay() {
    const playerOneHouses = $("#gameboard").lastChild.children;
    for (let i = 0; i < playerOneHouses.length; ++i) {
      playerOneHouses[i].onclick = null;
      playerOneHouses[i].className = "house";
    }
  }

  resetBoard(numSeeds, numHouses) {
    this.boardController.reset(numSeeds, numHouses);
    this.updateScores(1);
    this.updateScores(2);
  }

  /**
   * Updates the Score of a player in the UI
   * @param {*} player 1 or 2
   */
  updateScores = (player) => {
    $(`#player${player}-score`).innerHTML =
      this.boardController.getScore(player);
  };

  /**
   * Sends a new message to the UI
   * @param {*} text
   */
  sendMessage = (text) => {
    $("#prevMsg").innerHTML = $("#currMsg").innerHTML;
    $("#currMsg").innerHTML = text;
  };
}
