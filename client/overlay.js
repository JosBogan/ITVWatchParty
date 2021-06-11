const container = document.createElement("div");
const headerContainer = document.createElement("div");
const messagesContainer = document.createElement("div");
messagesContainer.classList.add("messages_container");
const inputContainer = document.createElement("div");

const input = document.createElement("input");
input.placeholder = "Start Chatting";
const submitButton = document.createElement("button");
const video = document.querySelector("video");
const createRoom = document.createElement("button");
const joinRoomInput = document.createElement("input");
joinRoomInput.placeholder = "Enter Room Code";
const joinRoomButton = document.createElement("button");

createRoom.innerText = "Create Room";
joinRoomButton.innerText = "Join Room";

const generateRoomId = () => {
  const options = "abcdefghifjlmnopqrstuvwxyzABCDEFGHIFJLMNOPQRSTUVWXYZ";
  const roomLength = 6;
  let roomId = "";
  for (let i = 0; i < roomLength; i++) {
    const index = Math.floor(Math.random() * options.length);
    roomId += options[index];
  }
  return roomId;
};

const createRoomInit = () => {
  const roomId = generateRoomId();
  socketFunctionality(roomId);
};

const joinRoomInit = () => {
  socketFunctionality(joinRoomInput.value);
};

const socketFunctionality = (roomId) => {
  const idHeader = document.createElement("div");
  idHeader.innerText = `Room ID: ${roomId}`;
  headerContainer.appendChild(idHeader);
  const socket = io("ws://localhost:8080", {
    extraHeaders: {
      "my-custom-header": "abcd",
    },
  });
  socket.on("connect", () => {
    console.log("connected to server");
    socket.emit("joinRoom", roomId);
  });

  socket.on("fromServer", (msg) => {
    const text = document.createElement("div");
    text.classList.add("message_container");
    text.innerText = msg;
    messagesContainer.appendChild(text);
  });

  socket.on("fromServerVideo", ({ action }) => {
    console.log(action);
    console.log(video);
    switch (action) {
      case "play":
        console.log("play case");
        if (video.paused) video.play();
        break;
      case "pause":
        if (!video.paused) video.pause();
    }
  });

  const sendMessage = () => {
    console.log("here");
    socket.emit("chat message", { room: roomId, msg: input.value });
  };

  const sendVideoData = (action) => {
    socket.emit("videoEvent", { room: roomId, msg: { action } });
  };
  submitButton.addEventListener("click", sendMessage);
  video.addEventListener("play", () => sendVideoData("play"));
  video.addEventListener("pause", () => sendVideoData("pause"));
};

container.classList.add("chat_container");
submitButton.innerText = "Send Message";
container.innerHTML = "<h1>CHAT ROOM</h1>";

createRoom.addEventListener("click", createRoomInit);
joinRoomButton.addEventListener("click", joinRoomInit);

container.appendChild(headerContainer);
container.appendChild(messagesContainer);
container.appendChild(inputContainer);

headerContainer.appendChild(joinRoomInput);
headerContainer.appendChild(createRoom);
headerContainer.appendChild(joinRoomButton);
inputContainer.appendChild(input);
inputContainer.appendChild(submitButton);
document.body.appendChild(container);
