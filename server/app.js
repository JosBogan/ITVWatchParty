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
    console.log("urlCheckroomId", roomId);
    if (roomData[roomId]) {
      socket.emit("roomFound", roomData[roomId].url);
    } else {
      socket.emit("roomNotFound", roomId);
    }
  });

  socket.on("createRoom", (data) => {
    console.log("creating Room", data);
    socket.join(data.roomId);

    roomData[data.roomId] = {
      url: data.url,
      roomId: data.roomId,
    };
    socket.emit("joinedRoom", roomData[data.roomId]);
  });

  socket.on("joinedRoom", (data) => {
    console.log("joinedRoomData", data);
  });

  socket.on("joinRoom", (data) => {
    console.log(" join room Id", data.roomId);
    socket.join(data.roomId);

    if (roomData[data.roomId]) {
      socket.emit("joinedRoom", roomData[data.roomId]);
    } else {
      console.log("Room not found - " + data.roomId);
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
