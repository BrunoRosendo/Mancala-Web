const INFINITY = Number.MAX_SAFE_INTEGER;
const MINUS_INFINITY = Number.MIN_SAFE_INTEGER;

const HARD_DEPTH = 2;
const EXTREME_DEPTH = 7;

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
      case 'extreme':
        houseIdx = this.extremeTurn();
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
   * Uses minimax with HARD_DEPTH
   */
  hardTurn() {
    const board = this.boardController.copy();
    return this.minimax(board, HARD_DEPTH, 2).bestPlay;
  }

  /**
   * Uses minimax with EXTREME_DEPTH
   */
   extremeTurn() {
    const board = this.boardController.copy();
    return this.minimax(board, EXTREME_DEPTH, 2).bestPlay;
  }

  minimax(board, depth, player) {
    if (depth === 0 || this.boardController.isPlayerBoardEmpty(player, board))
      return { score: this.minimaxEval(board, player) };

    const possiblePlays = this.boardController.getPossiblePlays(player, board);
    let bestPlay = null;

    if (player === 2) {
      let maxEval = MINUS_INFINITY;

      for (let play of possiblePlays) {
        const newBoard = [...board];
        const playAgain = this.boardController.turn(play, 2, newBoard);

        const evaluation = this.minimax(newBoard, playAgain ? depth : depth - 1, playAgain ? 2 : 1).score;
        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestPlay = play;
        }
      }
      return { score: maxEval, bestPlay };

    } else {
      let minEval = INFINITY;

      for (let play of possiblePlays) {
        const newBoard = [...board];
        const playAgain = this.boardController.turn(play, 1, newBoard);

        const evaluation = this.minimax(newBoard, playAgain ? depth : depth - 1, playAgain ? 1 : 2).score;
        if (evaluation < minEval) {
          minEval = evaluation;
          bestPlay = play;
        }
      }
      return { score: minEval, bestPlay };
    }
  }

  minimaxEval(board, player) {
    // Check end to collect remaining seeds
    if (this.boardController.isPlayerBoardEmpty(player, board))
      this.boardController.collectAllSeeds(player === 1 ? 2 : 1, board);

    return this.boardController.getScore(2, board) - this.boardController.getScore(1, board);
  }
}
