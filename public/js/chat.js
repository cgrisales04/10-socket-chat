const url = "http://localhost:8080/api/auth";

let usuario = null;
let socket = null;

//Referencias HTML
const txtUid = document.getElementById("txtUid");
const txtMensaje = document.getElementById("txtMensaje");
const ulUsuarios = document.getElementById("ulUsuarios");
const ulMensajes = document.getElementById("ulMensajes");
const btnSalir = document.getElementById("btnSalir");

//Validar Token LocalStorage
const validarJWT = async () => {
  const token = localStorage.getItem("token") || "";
  if (token.length <= 10) {
    window.location = "index.html";
    throw new Error("No hya token en el servidor");
  }
  const resp = await fetch(url, {
    headers: { "x-token": token },
  });
  const { usuario: userDB, token: tokenDB } = await resp.json();
  localStorage.setItem("token", tokenDB);
  usuario = userDB;
  document.title = usuario.nombre;

  await conectarSocket();
};

const conectarSocket = async () => {
  const socket = io({
    extraHeaders: {
      "x-token": localStorage.getItem("token"),
    },
  });
  socket.on("connect", () => {
    console.log("Socket Online");
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnect");
  });

  socket.on("recibir-mensajes", (payload) => renderMensajes(payload));
  socket.on("usuarios-activos", (payload) => renderUsuarios(payload));
  socket.on("mensaje-privado", (payload) => {
    console.log("Privado: ", payload);
  });

  txtMensaje.addEventListener("keyup", ({ keyCode }) => {
    const uid = txtUid.value;
    const mensaje = txtMensaje.value;
    if (keyCode !== 13) return;
    if (mensaje.length === 0) return;
    socket.emit("enviar-mensaje", { mensaje, uid });
    txtMensaje.value = "";
  });
};

const renderUsuarios = (usuarios = []) => {
  let usersHtml = "";
  usuarios.forEach(({ nombre, uid }) => {
    usersHtml += `
      <li>
        <p>
          <h5 class="text-success">${nombre}</h5>
          <span class="fs-6 text-muted">${uid}</span>
        </p>
      </li>
    `;
  });
  ulUsuarios.innerHTML = usersHtml;
};

const renderMensajes = (mensajes = []) => {
  let mensajesHTML = "";
  mensajes.forEach(({ nombre, mensaje }) => {
    mensajesHTML += `
      <li>
        <p>
          <span class="text-primary">${nombre}</span>
          <span>${mensaje}</span>
        </p>
      </li>
    `;
  });
  ulMensajes.innerHTML = mensajesHTML;
};

btnSalir.onclick = async () => {
    console.log("consent revoked");
    localStorage.clear();
    location.reload();
};

const main = async () => {
  await validarJWT();
};

main();
