const defaultGroup = 69420;

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
    const res = await fetch(
      "http://twserver.alunos.dcc.fc.up.pt:8008/register",
      {
        method: "POST",
        body: JSON.stringify({
          nick: username,
          password: pass,
        }),
      }
    )
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Couldn't Log in!");
          return -1;
        } else {
          console.log("Logged in!");
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
    const res = await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/join", {
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
          return -1;
        } else {
          console.log("Joined group lobby...", res);
          this.game = res.game;
          return 1;
        }
      });

    return res;
  };

  notify = (move) => {
    fetch("http://twserver.alunos.dcc.fc.up.pt:8008/notify", {
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
        } else {
          console.log("Notification Successful!");
        }
      });
  };

  leave = async () => {
    await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/leave", {
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
        } else {
          console.log("Left the game successfully.");
        }
      });
  };

  ranking = async () => {
    const result = await fetch(
      "http://twserver.alunos.dcc.fc.up.pt:8008/ranking",
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    )
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Error retrieving scoreboard.", res.error);
        } else {
          console.log("Successfully retrieved scoreboard.");
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
