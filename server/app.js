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

io.on("connection", (socket) => {
  console.log("a user has connected");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("has joined " + roomId);
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
