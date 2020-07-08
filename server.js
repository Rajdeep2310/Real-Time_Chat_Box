const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { emit } = require("process");
const formatMessage = require("./utility/messages.js");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utility/users.js");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set staic folder
app.use(express.static(path.join(__dirname, "Templates")));

const botName = "ChatCord Bot";

// Run when cliet connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //Welcome to the room
    socket.emit("message", formatMessage(botName, "Welcome to ChatApp !!!"));

    //Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, ` ${user.username} has joined the room`)
      );
    //send users an room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen for chat mesage events
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  // runs when user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the room`)
      );
      //send users an room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
