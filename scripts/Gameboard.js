class Gameboard {
  constructor(parent, seedRange, houseRange) {
    this.parent = $(parent);
    this.seedRange = parseInt(seedRange);
    this.houseRange = parseInt(houseRange);

    this.create();
  }

  create() {
    this.board = Array(this.houseRange).fill(this.seedRange);
    this.board.push(0); // Storage
    this.board = this.board.concat(this.board);

    this.parent.appendChild(this.createStorage());
    this.parent.appendChild(this.createMiddleboard());
    this.parent.appendChild(this.createStorage());
    this.parent.appendChild(this.createMiddleboard());
  }

  reset(numSeeds, numHouses) {
    if (numSeeds) this.seedRange = parseInt(numSeeds);
    if (numHouses) this.houseRange = parseInt(numHouses);

    destroyChildren(this.parent);

    this.create();
  }

  createStorage() {
    const storage = document.createElement("div");
    storage.className = "storage";

    return storage;
  }

  createMiddleboard() {
    const middleBoard = document.createElement("div");
    middleBoard.className = "middleBoard";

    for (let i = 0; i < this.houseRange; ++i) {
      const house = document.createElement("div");
      house.className = "house";
      for (let j = 0; j < this.seedRange; ++j)
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

  /**
   * Updates the board taking into account the oldBoard
   * @param {*} oldBoard
   * @returns Number of seeds added to P1's storage
   */
  updateSeeds(oldBoard) {
    const containers = this.parent.children;

    // Player2's storage
    this.updateCellSeeds(
      containers[0],
      oldBoard[this.board.length - 1],
      this.board[this.board.length - 1]
    );

    // Second player (top row)
    const fstMiddle = containers[1].children;
    for (let i = 1; i <= fstMiddle.length; i++) {
      const house = fstMiddle[fstMiddle.length - i]; // reverse order in HTML
      this.updateCellSeeds(
        house,
        oldBoard[i + this.houseRange],
        this.board[i + this.houseRange]
      );
    }

    // Player1's storage
    this.updateCellSeeds(
      containers[2],
      oldBoard[this.houseRange],
      this.board[this.houseRange]
    );

    // First player (bottom row)
    const sndMiddle = containers[3].children;
    for (let i = 0; i < sndMiddle.length; i++) {
      const house = sndMiddle[i]; // reverse order in HTML
      this.updateCellSeeds(house, oldBoard[i], this.board[i]);
    }

    return this.board[this.houseRange] - oldBoard[this.houseRange];
  }

  updateCellSeeds(elem, oldNumSeeds, newNumSeeds) {
    let diff = newNumSeeds - oldNumSeeds;

    if (diff < 0) {
      while (diff++ < 0) elem.removeChild(elem.firstChild);
      return;
    }

    while (diff-- > 0) elem.appendChild(this.createSeed());
  }

  onPlayerHouse(idx, player) {
    return player == 1
      ? idx >= 0 && idx < this.houseRange
      : idx > this.houseRange && idx < this.board.length - 1;
  }

  /**
   * @returns True if the player can play again. False otherwise
   */
  turn(houseIdx, player) {
    if (player === 2) houseIdx += this.houseRange + 1;
    let numSeeds = this.board[houseIdx];

    const [ownStorage, enemyStorage] =
      player === 1
        ? [this.houseRange, this.board.length - 1]
        : [this.board.length - 1, this.houseRange];

    this.board[houseIdx] = 0;

    let idx = houseIdx;
    for (; numSeeds > 0; --numSeeds) {
      idx = ++idx % this.board.length;
      if (idx === enemyStorage) {
        ++numSeeds;
        continue;
      }

      this.board[idx]++;
    }

    if (idx === ownStorage) return true;
    if (!this.onPlayerHouse(idx, player) || this.board[idx] > 1) return false;

    const distFromMiddle = Math.abs(this.houseRange - idx);
    const middleStorageIdx = this.houseRange;
    const oppositeIdx =
      player === 1
        ? middleStorageIdx + distFromMiddle
        : middleStorageIdx - distFromMiddle;

    this.board[ownStorage] += this.board[oppositeIdx] + this.board[idx];
    this.board[oppositeIdx] = 0;
    this.board[idx] = 0;

    return false;
  }

  isPlayerBoardEmpty(player) {
    const start = player === 1 ? 0 : this.houseRange + 1;

    for (let i = start; i < start + this.houseRange; ++i)
      if (this.board[i] > 0) return false;

    return true;
  }

  collectAllSeeds(player) {
    const storage = player === 1 ? this.houseRange : this.board.length - 1;

    for (let i = 0; i < this.houseRange; ++i) {
      this.board[storage] += this.board[i];
      this.board[i] = 0;
    }
    for (let i = this.houseRange + 1; i < this.board.length - 1; ++i) {
      this.board[storage] += this.board[i];
      this.board[i] = 0;
    }
  }

  /**
   *
   * @param {*} player 1 or 2
   * @returns Score of a player
   */
  getScore(player) {
    return player === 1
      ? this.board[this.houseRange]
      : this.board[this.board.length - 1];
  }
}
