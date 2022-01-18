class Game {
  constructor(seedRange, houseRange) {
    this.boardController = new Gameboard("#gameboard", seedRange, houseRange);
  }

  /**
   * Start a game
   * @param {*} playFirst
   * @param {*} multiplayer
   * @param {*} aiLevel
   */
  play(playFirst, multiplayer, aiLevel) {
    this.currentPlayer = playFirst ? 1 : 2;
    this.multiplayer = multiplayer;

    if (multiplayer) {
      multiplayerController
        .join(game.boardController.houseRange, game.boardController.seedRange)
        .then((res) => {
          if (res > 0) {
            showBlockElem($("#loading"));

            this.eventSource = new EventSource(
              `${HOST}:${PORT}/update?nick=${multiplayerController.user1.username}&game=${multiplayerController.game}`
            );
            this.eventSource.onmessage = this.updateMultiplayerGame;
          } else {
            // SHOW error joining...
          }
        });
    } else {
      this.bot = new Bot(aiLevel, this.boardController);
      if (playFirst) this.enablePlay();
      else this.aiTurn();
    }
  }

  /**
   * Updates the game after receiving SSE
   * @param {*} event
   */
  updateMultiplayerGame = (event) => {
    const data = JSON.parse(event?.data);
    console.log("data from SSE:", data);
    const board = data.board;
    let firstUpdate = false;

    // 1st update received
    if (!multiplayerController.user2) {
      firstUpdate = true;
      hideElem($("#loading"));
      $("button[id=concedeButton]").innerText = "Concede";
    }

    if (board) {
      const oldBoard = this.boardController.copy();
      const oldScore = this.boardController.getScore(
        multiplayerController.turn
      );
      const nextPlayer = multiplayerController.getPlayerNumber(board.turn);

      for (const [username, boardContainers] of Object.entries(board.sides)) {
        const player = multiplayerController.getPlayerNumber(username);
        if (multiplayerController.user2 == null && player == 2) {
          multiplayerController.user2 = new User(username, null);
          $("#player1-name").innerHTML = multiplayerController.user1.username;
          $("#player2-name").innerHTML = multiplayerController.user2.username;
        }

        for (const [type, value] of Object.entries(boardContainers)) {
          if (type == "store")
            this.boardController.updateCell(
              this.boardController.houseRange,
              player,
              parseInt(value)
            );
          else {
            for (const [houseIdx, numSeeds] of Object.entries(value)) {
              this.boardController.updateCell(
                parseInt(houseIdx),
                player,
                parseInt(numSeeds)
              );
            }
          }
        }
      }

      this.boardController.updateSeeds(oldBoard);

      const newScore = this.boardController.getScore(
        multiplayerController.turn
      );
      const scoreDiff = newScore - oldScore;

      if (!firstUpdate) {
        this.sendMessage(
          `${
            multiplayerController.turn == 1 ? "You" : "Your Opponent"
          } scored ${scoreDiff} ${
            scoreDiff != 1 ? "points" : "point"
          } this round!`
        );
      } else if (nextPlayer == 2) {
        this.sendMessage("Your opponent starts first!");
      }

      this.updateScores(multiplayerController.turn);
      this.disablePlay();

      if (data.hasOwnProperty("winner")) {
        this.declareMultiplayerWinner(
          data.winner,
          multiplayerController.getPlayerNumber(nextPlayer)
        );
      } else {
        multiplayerController.turn = nextPlayer;
        if (nextPlayer == 1) this.enablePlay();
      }
    } else if (data.hasOwnProperty("winner")) {
      if (data.winner != null) {
        // Won because opponent conceded
        if (data.winner == multiplayerController.user1.username)
          showSnackbar(
            `${multiplayerController.user2.username} left the game!`
          );
        this.declareMultiplayerWinner(data.winner, data.winner);
      } else {
        // Leaving queue
        endGame();
      }
    }
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
    if (this.multiplayer) {
      multiplayerController.notify(houseIdx);
    } else {
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
  }

  isGameOver() {
    return this.boardController.isPlayerBoardEmpty(this.currentPlayer);
  }

  /**
   * This method is needed because the board in the final play does not contain the collected seeds after running out of moves
   * @param {*} player
   */
  collectRemainingSeeds = (player) => {
    const oldBoard = this.boardController.copy();
    this.boardController.collectAllSeeds(player);
    this.boardController.updateSeeds(oldBoard);

    this.updateScores(1);
    this.updateScores(2);
  };

  /**
   * Declares who won the game
   * @param {*} conceded Whether the local user has conceded
   */
  declareWinner(conceded = false) {
    if (this.enablePlayTimeout) clearTimeout(this.enablePlayTimeout); // Clears the timeout to enable P1 turn

    let rankingScoreIncrement = 0;
    if (conceded) {
      this.collectRemainingSeeds(2);
      this.sendMessage("Player 2 won!");
    } else {
      this.collectRemainingSeeds(this.currentPlayer === 1 ? 2 : 1);

      const playerOneScore = this.boardController.getScore(1);
      const playerTwoScore = this.boardController.getScore(2);

      if (playerOneScore > playerTwoScore) {
        this.sendMessage("Player 1 won!");
        rankingScoreIncrement = 1;
      } else if (playerTwoScore > playerOneScore)
        this.sendMessage("Player 2 won!");
      else this.sendMessage("It's a tie!");
    }

    updateLocalRank(rankingScoreIncrement);

    showBlockElem($("button[id=endGameButton]"));
    hideElem($("button[id=concedeButton]"));
    $("#messages").scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }

  declareMultiplayerWinner = (player, collectingPlayer) => {
    if (this.enablePlayTimeout) clearTimeout(this.enablePlayTimeout); // Clears the timeout to enable P1 turn

    this.disablePlay();
    this.collectRemainingSeeds(collectingPlayer); // THIS IS NEEDED BECAUSE SERVER DOES NOT RETURN FINISHED BOARD. IN PART 3 WE COULD IMPLEMENT THIS ON SERVER

    if (player == null) {
      this.sendMessage("It's a tie!");
    } else if (multiplayerController.getPlayerNumber(player) == 1) {
      this.sendMessage(`You won!`);
    } else {
      this.sendMessage(`${multiplayerController.user2.username} won!`);
    }

    toggleBlockElem($("button[id=endGameButton]"));
    hideElem($("button[id=concedeButton]"));
  };

  enablePlay() {
    this.enablePlayTimeout = setTimeout(() => {
      this.sendMessage("It's your turn!");

      const playerOneHouses = $("#gameboard").lastChild.children;
      for (let i = 0; i < playerOneHouses.length; ++i) {
        const playerOneHouse = playerOneHouses[i].firstChild;
        if (playerOneHouse.children.length <= 1) continue; // Only has score child
        playerOneHouse.onclick = () => this.playerTurn(i);
        playerOneHouse.className = "house onHover";
      }
    }, 700);
  }

  disablePlay() {
    const playerOneHouses = $("#gameboard").lastChild.children;
    for (let i = 0; i < playerOneHouses.length; ++i) {
      const playerOneHouse = playerOneHouses[i].firstChild;
      playerOneHouse.onclick = null;
      playerOneHouse.className = "house";
    }
  }

  resetBoard(numSeeds, numHouses) {
    this.boardController.reset(numSeeds, numHouses);
    multiplayerController.reset();
    this.resetScores();
    this.eventSource?.close();
    hideElem($("#loading"));
  }

  /**
   * Updates the Score of a player in the UI
   * @param {*} player 1 or 2
   */
  updateScores = (player = 1) => {
    $(`#player${player}-score`).innerHTML =
      this.boardController.getScore(player);
  };

  /**
   * Sends a new message to the UI
   * @param {*} text
   */
  sendMessage = (text) => {
    $("#prevMsg").innerHTML = $("#currMsg").innerHTML;

    const currMsgElem = $("#currMsg");
    currMsgElem.innerHTML = text;

    currMsgElem.classList.remove("animation");
    void currMsgElem.offsetWidth; // Trigger a reflow between removing and adding the animation
    currMsgElem.classList.add("animation");
  };

  concede = async () => {
    if (this.multiplayer) {
      await multiplayerController.leave();
    } else this.declareWinner(true);
  };

  resetScores = () => {
    this.updateScores(1);
    this.updateScores(2);
    $("#player1-name").innerHTML = "Player 1";
    $("#player2-name").innerHTML = "Player 2";
  };
}
