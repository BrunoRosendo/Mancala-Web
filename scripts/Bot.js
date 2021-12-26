class Bot {
  constructor(level, boardController) {
    this.level = level;
    this.boardController = boardController;
  }

  turn() {
    const oldBoard = this.boardController.copy();
    let houseIdx;

    switch (this.level) {
      case 'easy':
        houseIdx = this.easyTurn();
        break;
      case 'medium':
        houseIdx = this.mediumTurn();
        break;
      case 'hard':
        houseIdx = this.hardTurn();
        break;
      default:
        console.log("Invalid AI Level");
        return;
    }
    const playAgain = this.boardController.turn(houseIdx, 2);
    this.boardController.updateSeeds(oldBoard);

    return playAgain;
  }

  /**
   * Chooses a random not empty house
   */
   easyTurn() {
    const possiblePlays = this.boardController.getPossiblePlays(2);

    const choice = Math.floor(
      Math.random() * possiblePlays.length
    );
  
    return possiblePlays[choice];
  }

  /**
   * Selects a house that lets him play again
   * If there are none, chooses randomly
   */
  mediumTurn() {
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
   * Selects a house that lets him play again
   * If there are none, chooses the house which gives him the most points
   * Prioritizes a turn which gives no chance of playing to the other player
   */
  hardTurn() {
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
}
