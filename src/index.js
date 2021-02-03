const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { createMessage } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }) => {
    socket.join(room);

    socket.emit("message", createMessage("Welcome!"));

    socket.broadcast
      .to(room)
      .emit("message", createMessage(`${username} just joined the chat! =)`));

    // socket.emit, io.emit, socket.broadcast.emit`
    // io.to.emit, socket.broadcast.to.emit
  });

  socket.on("sendMessage", (message, cb) => {
    io.emit("message", createMessage(message));
    cb("Received!!");
  });

  socket.on("sendLocation", (location, cb) => {
    console.log("loc received");
    io.emit(
      "location",
      createMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    cb("Location shared!");
  });

  socket.on("disconnect", () => {
    io.emit("message", createMessage("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
