const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const PORT = 8080;

const roomData = {};

io.on("connection", (socket) => {
  console.log("a user has connected");
  // have object store that has room url, timestamp data etc.

  socket.on("serverUrlCheck", (roomId) => {
    console.log(roomData[roomId]);
    if (roomData[roomId]) {
      socket.emit("clientUrlCheck", roomData[roomId].url);
    }
  });

  socket.on("joinRoom", (data) => {
    socket.join(data.roomId);

    if (roomData[data.roomId]) {
      socket.emit("joinedRoom", roomData[data.roomId]);
    } else {
      roomData[data.roomId] = {
        url: data.url,
      };
    }

    io.to(data.roomId).emit("userJoined", data.userName);
  });

  socket.on("chat message", (obj) => {
    io.to(obj.room).emit("fromServer", obj.msg);
  });
  socket.on("disconnect", (msg) => {
    console.log("a user has disconnected");
  });

  socket.on("videoEvent", (obj) => {
    io.to(obj.room).emit("fromServerVideo", obj.msg);
  });
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
