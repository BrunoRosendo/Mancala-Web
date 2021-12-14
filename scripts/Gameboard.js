class Gameboard {

  constructor(parent, seedRange, houseRange) {
    this.parent = $(parent);
    this.seedRange = parseInt(seedRange);
    this.houseRange = parseInt(houseRange);

    this.createBoard();
  }

  createBoard() {
    this.board = [5];
    this.board = this.board.concat(Array(this.houseRange).fill(this.seedRange));
    this.board = this.board.concat(this.board);

    this.parent.appendChild(this.drawStorage(1));
    this.parent.appendChild(this.drawMiddleBoard(1));
    this.parent.appendChild(this.drawStorage(2));
    this.parent.appendChild(this.drawMiddleBoard(2));
  }

  resetBoard(numSeeds, numHouses) {
    this.seedRange = numSeeds ? parseInt(numSeeds) : this.seedRange;
    this.houseRange = numHouses ? parseInt(numHouses) : this.houseRange;

    while (this.parent.firstChild)
      this.parent.removeChild(this.parent.firstChild);

    this.createBoard();
  }

  drawStorage(player) {
    const storage = document.createElement("div");
    storage.className = "storage";
    this.createSeed(storage);

    const i = player == 1 ? 0 : this.houseRange + 1;
    for (let j = 0; j < this.board[i]; ++j)
      storage.appendChild(this.createSeed());

    return storage;
  }

  drawMiddleBoard(player) {
    const middleBoard = document.createElement("div");
    middleBoard.className = "middleBoard";

    const start = player == 1 ? 1 : this.houseRange + 2;

    for (let i = start; i < start + this.houseRange; ++i) {
      const house = document.createElement("div");
      house.className = "house";
      for (let j = 0; j < this.board[i]; ++j)
        house.appendChild(this.createSeed());

      middleBoard.appendChild(house);
    }

    return middleBoard;
  }

  createSeed() {
    const randTop = Math.floor(20 + Math.random() * 50);
    const randLeft = Math.floor(20 + Math.random() * 50);

    const seed = document.createElement("div");
    seed.className = "seed";
    seed.style.top = randTop + "%";
    seed.style.left = randLeft + "%";

    const randRot = Math.floor(Math.random() * 360);
    seed.style.transform = "rotate(" + randRot + "deg)";

    return seed;
  }
}
