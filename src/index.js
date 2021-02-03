const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.emit("message", { text: "Welcome!", createdAt: Date().getTime() });
  socket.broadcast.emit("message", {
    text: "** a new user has joined **",
    createdAt: Date().getTime(),
  });

  socket.on("sendMessage", (message, cb) => {
    io.emit("message", message);
    cb("Received!!");
  });

  socket.on("sendLocation", (location, cb) => {
    console.log("loc received");
    io.emit(
      "location",
      `https://google.com/maps?q=${location.latitude},${location.longitude}`
    );
    cb("Location shared!");
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
