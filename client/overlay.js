const container = document.createElement("div");
const headerContainer = document.createElement("div");
const messagesContainer = document.createElement("div");
messagesContainer.classList.add("messages_container");
const inputContainer = document.createElement("div");

const input = document.createElement("input");
input.placeholder = "Start Chatting";
const submitButton = document.createElement("button");
const video = document.querySelector("video");

chrome.storage.sync.get(["socket"], function (result) {
  const socket = result;

  chrome.storage.sync.get(["roomId"], function (result) {
    const roomId = result;

    socketFunctionality(socket, roomId);
  });
});

const socketFunctionality = (socket, roomId) => {
  console.log(socket);
  socket.on("fromServer", (msg) => {
    const text = document.createElement("div");
    text.classList.add("message_container");
    text.innerText = msg;
    messagesContainer.appendChild(text);
  });

  socket.on("userJoined", (msg) => {
    const text = document.createElement("div");
    text.classList.add("joined_message_container");
    text.innerText = msg + " has joined";
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

  socket.on("disconnect", () => {
    localStorage.removeItem("userName");
  });

  const sendMessage = () => {
    const msg = getName() + ": " + input.value;
    socket.emit("chat message", { room: roomId, msg: msg });
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

container.appendChild(headerContainer);
container.appendChild(messagesContainer);
container.appendChild(inputContainer);

inputContainer.appendChild(input);
inputContainer.appendChild(submitButton);
document.body.appendChild(container);
