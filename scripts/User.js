const defaultGroup = 69420;

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  /**
   *
   * @param {*} size Nº houses
   * @param {*} initial Nº seeds
   * @returns
   */
  join = async (size, initial) => {
    await fetch("http://twserver.alunos.dcc.fc.up.pt:8008/join", {
      method: "POST",
      body: JSON.stringify({
        group: defaultGroup,
        nick: this.username,
        password: this.password,
        size: size,
        initial: initial,
      }),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res?.error) {
          console.log("Error Joining game.", res.error);
        } else {
          console.log("Joined group lobby...", res);
          this.game = res.game;
        }
      });
  };
}
