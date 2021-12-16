class Game {
  constructor(seedRange, houseRange) {
    this.boardController = new Gameboard("#gameboard", seedRange, houseRange);
  }

  play() {
    const oldBoard = [...this.boardController.board];
    this.boardController.turn(0, 1);
    this.boardController.updateSeeds(oldBoard);
  }

  resetBoard(numSeeds, numHouses) {
    this.boardController.reset(numSeeds, numHouses);
  }
}
