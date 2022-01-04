class Game {
  constructor(seedRange, houseRange) {
    this.boardController = new Gameboard("#gameboard", seedRange, houseRange);
  }

  play(playFirst, multiplayer, aiLevel) {
    this.currentPlayer = playFirst ? 1 : 2;
    this.multiplayer = multiplayer;

    if (multiplayer) {
      user
        .join(game.boardController.houseRange, game.boardController.seedRange)
        .then(() => {
          const eventSource = new EventSource(
            `http://twserver.alunos.dcc.fc.up.pt:8008/update?nick=${user.username}&game=${user.game}`
          );
          eventSource.onmessage = this.handleSSE;
        });
    } else {
      this.bot = new Bot(aiLevel, this.boardController);
      if (playFirst) this.enablePlay();
      else this.aiTurn();
    }
  }

  /**
   * Handles SSE messages
   * @param {*} event
   */
  handleSSE = (event) => {
    const data = JSON.parse(event?.data);
    // console.log("data from SSE:", data);
    if (data.board) this.updateGame(data.board);
  };

  updateGame = (board) => {
    const oldBoard = this.boardController.copy();
    for (const [username, boardContainers] of Object.entries(board.sides)) {
      console.log(username, ":", boardContainers);
      const player = username == user.username ? 1 : 2;

      for (const [type, value] of Object.entries(boardContainers)) {
        if (type == "store")
          this.boardController.updateCell(
            this.boardController.houseRange,
            player,
            value
          );
        else {
          for (const [houseIdx, numSeeds] of Object.entries(value)) {
            this.boardController.updateCell(houseIdx, player, numSeeds);
          }
        }
      }
    }

    this.boardController.updateSeeds(oldBoard);

    const isPlayerTurn = board.turn == user.username;
    if (isPlayerTurn) console.log("It's your turn");
  };

  async aiTurn() {
    const oldScore = this.boardController.getScore(2);
    await sleep(1000);

    const playAgain = this.bot.turn();

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
      else await this.aiTurn();
      return; // Need to return here to avoid executing the next lines twice
    }

    this.currentPlayer = 1;
    if (this.isGameOver()) this.declareWinner();
    else this.enablePlay();
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
