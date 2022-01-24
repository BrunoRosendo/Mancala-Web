const defaultGroup = 14;
const HOST =
  "http://localhost"; /* http://localhost / http://twserver.alunos.dcc.fc.up.pt */
const PORT = 8000; /*  8000 / 8008 */
const HOST_URL = `${HOST}:${PORT}`;

class Multiplayer {
  constructor() {
    this.user1 = null;
    this.user2 = null;
    this.turn = 1;
  }

  /**
   *
   * @param {*} username
   * @param {*} pass
   * @returns -1 if fails, 1 otherwise
   */
  register = async (username, pass) => {
    const res = await fetch(`${HOST_URL}/register`, {
      method: "POST",
      body: JSON.stringify({
        nick: username,
        password: pass,
      }),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Couldn't Log in!", res.error);
          showSnackbar(res.error);
          return -1;
        } else {
          this.user1 = new User(username, pass);
          return 1;
        }
      });
    return res;
  };

  /**
   *
   * @param {*} size Nº houses
   * @param {*} initial Nº seeds
   * @returns
   */
  join = async (size, initial) => {
    const res = await fetch(`${HOST_URL}/join`, {
      method: "POST",
      body: JSON.stringify({
        group: defaultGroup,
        nick: this.user1.username,
        password: this.user1.password,
        size: size,
        initial: initial,
      }),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Error Joining game.", res.error);
          showSnackbar(res.error);
          return -1;
        } else {
          this.game = res.game;
          return 1;
        }
      });

    return res;
  };

  notify = (move) => {
    fetch(`${HOST_URL}/notify`, {
      method: "POST",
      body: JSON.stringify({
        nick: this.user1.username,
        password: this.user1.password,
        game: this.game,
        move: move,
      }),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Error notifying player's move.", res.error);
          showSnackbar(res.error);
        }
      });
  };

  leave = async () => {
    await fetch(`${HOST_URL}/leave`, {
      method: "POST",
      body: JSON.stringify({
        nick: this.user1.username,
        password: this.user1.password,
        game: this.game,
      }),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Error leaving game.", res.error);
          showSnackbar(res.error);
        }
      });
  };

  ranking = async () => {
    const result = await fetch(`${HOST_URL}/ranking`, {
      method: "POST",
      body: JSON.stringify({}),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Error retrieving scoreboard.", res.error);
          showSnackbar(res.error);
        } else {
          return res;
        }
      });

    return result;
  };

  /**
   * Returns player number
   * @param {*} username
   * @returns 1 if own, 2 if opponent
   */
  getPlayerNumber = (username) => (username == this.user1.username ? 1 : 2);

  reset = () => {
    this.turn = 1;
    this.game = null;
    this.user2 = null;
  };

  logout = () => {
    this.reset();
    this.user1 = null;
  };

  /**
   *
   * @returns True if user is logged, false otherwise
   */
  isLoggedIn = () => this.user1 != null;

  /**
   *
   * @returns true if there is an active multiplayer game
   */
  isPlaying = () => this.user2 != null;

  /**
   *
   * @returns true if the user is searching for a game
   */
  isSearching = () => this.game != null && !this.isPlaying();
}

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}
