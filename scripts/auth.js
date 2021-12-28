register = () => {
  const username = $("#usernameInput");
  const pass = $("#passwordInput");
  console.log(username.value, pass.value);
  fetch("http://twserver.alunos.dcc.fc.up.pt:8008/register", {
    method: "POST",
    body: JSON.stringify({
      nick: "monkin",
      password: "password123",
    }),
  });
};
