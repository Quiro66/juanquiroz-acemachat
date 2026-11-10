const { io } = require("socket.io-client");

const TOKEN = process.env.TOKEN;
const CONVERSATION_ID = process.env.CONVERSATION_ID;

if (!TOKEN || !CONVERSATION_ID) {
  console.error("Faltan TOKEN o CONVERSATION_ID");
  process.exit(1);
}

const socket = io("http://localhost:4000", {
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("Conectado:", socket.id);

  socket.emit("conversation:join", CONVERSATION_ID, (response) => {
    console.log("Respuesta al unirse:", response);

    if (!response.success) {
      socket.disconnect();
      return;
    }

    socket.emit(
      "message:send",
      {
        conversationId: CONVERSATION_ID,
        content: "¡Hola! Este mensaje viaja por Socket.IO.",
      },
      (result) => {
        console.log("Respuesta del envío:", result);
      },
    );
  });
});

socket.on("message:new", (message) => {
  console.log("Mensaje recibido en tiempo real:", message);
});

socket.on("connect_error", (error) => {
  console.error("Error de conexión:", error.message);
});

setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 3000);
