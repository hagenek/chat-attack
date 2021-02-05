const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { createMessage } = require("./utils/messages");
const {
  addUser,
  getUser,
  removeUser,
  getUserByRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("join", (options, callback) => {
    const { user, error } = addUser({ id: socket.id, ...options });
    console.log(user);

    if (error) {
      return callback(error);
    }

    console.log("room: ", user.room);
    socket.join(user.room);

    socket.emit("message", createMessage("Admin", "Welcome!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        createMessage("Admin", `${user.username} just joined the chat! =)`)
      );

    callback();
  });

  socket.on("sendMessage", (message, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", createMessage(user.username, message));
    cb("Received!!");
  });

  socket.on("sendLocation", (location, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "location",
      createMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    cb("Location shared!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        createMessage(user.username + " has left!")
      );
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
