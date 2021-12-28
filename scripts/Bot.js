const INFINITY = Number.MAX_SAFE_INTEGER;
const MINUS_INFINITY = Number.MIN_SAFE_INTEGER;

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
   * If there are none, chooses the house which gives him the most points
   * Prioritizes a turn which gives no chance of playing to the other player
   */
  mediumTurn() {
    const possiblePlays = this.boardController.getPossiblePlays(2);
    const currentScore = this.boardController.getScore(2, board);

    let replayable = false;
    let max = 0, chosen = possiblePlays[0];

    for (let play of possiblePlays) {
      const board = this.boardController.copy(); // Reset board
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

  /**
   * Uses minimax with X depth
   */
  hardTurn() {}

  minimax(board, depth, player) {
    if (depth === 0 || this.boardController.isPlayerBoardEmpty(player, board))
      return this.minimaxEval(board);

    const possiblePlays = this.boardController.getPossiblePlays(player, board);

    if (player === 2) {
      let maxEval = MINUS_INFINITY;

      for (let play of possiblePlays) {
        const newBoard = [...board];
        const playAgain = this.boardController.turn(play, 2, newBoard);

        const eval = this.minimax(newBoard, playAgain ? depth : depth - 1, playAgain ? 2 : 1);
        maxEval = max(maxEval, eval);
      }
      return maxEval;

    } else {
      let minEval = INFINITY;

      for (let play of possiblePlays) {
        const newBoard = [...board];
        const playAgain = this.boardController.turn(play, 1, newBoard);

        const eval = this.minimax(newBoard, playAgain ? depth : depth - 1, playAgain ? 1 : 2);
        minEval = min(minEval, eval);
      }
      return minEval;
    }
  }

  minimaxEval(board) {
    return this.boardController.getScore(2, board) - this.boardController.getScore(1, board);
  }
}
