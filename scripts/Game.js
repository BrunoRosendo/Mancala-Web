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
    // TODO: Check if the house is empty before selecting
    const houseIdx = Math.floor(
      Math.random() * this.boardController.houseRange
    );
    const oldBoard = [...this.boardController.board];

    const playAgain = this.boardController.turn(houseIdx, 2);
    this.boardController.updateSeeds(oldBoard);
    this.updateScores(2);

    if (playAgain) {
      this.aiTurn();
      return; // Need to return here to avoid executing the next lines twice?
    }

    this.currentPlayer = 1;
    if (this.isGameOver()) this.declareWinner();
    else this.enablePlay();
  }

  playerTurn(houseIdx) {
    const oldBoard = [...this.boardController.board];
    const playAgain = this.boardController.turn(houseIdx, 1);
    this.boardController.updateSeeds(oldBoard);
    this.updateScores(1);

    if (playAgain) return;

    this.disablePlay();
    this.currentPlayer = 2;
    if (this.isGameOver()) this.declareWinner();
    else this.aiTurn();
  }

  isGameOver() {
    return this.boardController.isPlayerBoardEmpty(this.currentPlayer);
  }

  declareWinner() {
    const oldBoard = [...this.boardController.board];
    this.boardController.collectAllSeeds(this.currentPlayer === 1 ? 2 : 1);
    this.boardController.updateSeeds(oldBoard);
    this.updateScores(1);
    this.updateScores(2);
    const playerOneScore = this.boardController.getScore(1);
    const playerTwoScore = this.boardController.getScore(2);

    if (playerOneScore > playerTwoScore) alert("Player one won!");
    else if (playerTwoScore > playerOneScore) alert("Player two won!");
    else alert("It's a tie!");

    this.resetBoard(); // This should be called after clicking okay upon winning
  }

  enablePlay() {
    const playerOneHouses = $("#gameboard").lastChild.children;
    for (let i = 0; i < playerOneHouses.length; ++i) {
      if (playerOneHouses[i].children.length === 0) continue;
      playerOneHouses[i].onclick = () => this.playerTurn(i);
      playerOneHouses[i].className = "house onHover";
    }
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
}
