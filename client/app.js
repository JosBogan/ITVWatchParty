function init() {
  const joinRoomButton = document.querySelector("#join_room_button");
  const createRoomButton = document.querySelector("#create_room_button");
  const joinRoomInput = document.querySelector("#room_id_input");
  const roomCode = document.querySelector("#room_code");

  console.log(joinRoomButton);

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

  const generateName = () => {
    const animals = [
      "🙈",
      "🙉",
      "🙊",
      "🐵",
      "🐒",
      "🦍",
      "🐶",
      "🐕",
      "🐩",
      "🐺",
      "🦊",
      "🦝",
      "🐱",
      "🐈",
      "🐈",
      "🦁",
      "🐯",
      "🐅",
      "🐆",
      "🐴",
      "🐎",
      "🦄",
      "🦓",
      "🦌",
      "🐮",
      "🐂",
      "🐃",
      "🐄",
      "🐷",
      "🐖",
      "🐗",
      "🐏",
      "🐑",
      "🐐",
      "🐪",
      "🐫",
      "🦙",
      "🦒",
      "🐘",
      "🦏",
      "🦛",
      "🐭",
      "🐁",
      "🐀",
      "🐹",
      "🐰",
      "🐇",
      "🐿",
      "🦔",
      "🦇",
      "🐻",
      "🐻",
      "🐨",
      "🐼",
      "🦘",
      "🦡",
      "🦃",
      "🐔",
      "🐓",
      "🐣",
      "🐤",
      "🐥",
      "🐦",
      "🐧",
      "🕊",
      "🦅",
      "🦆",
      "🦢",
      "🦉",
      "🦚",
      "🦜",
      "🐸",
      "🐊",
      "🐢",
      "🦎",
      "🐍",
      "🐲",
      "🐉",
      "🦕",
      "🦖",
      "🐳",
      "🐋",
      "🐬",
      "🐟",
      "🐠",
      "🐡",
      "🦈",
      "🐙",
      "🐌",
      "🦋",
      "🐛",
      "🐜",
      "🐝",
      "🐞",
      "🦗",
      "🕷",
      "🦂",
      "🦟",
    ];
    const idPart2 = Math.floor(Math.random() * 100);
    const animalsIndex = Math.floor(Math.random() * animals.length);
    return animals[animalsIndex] + "-" + idPart2;
  };
  const getName = () => {
    if (!localStorage.getItem("userName")) {
      const userName = generateName();
      localStorage.setItem("userName", userName);
    }
    return localStorage.getItem("userName");
  };

  const createRoomInit = () => {
    getName();
    const roomId = generateRoomId();
    socketFunctionality(roomId);
    injectScript();
  };

  const joinRoomInit = () => {
    getName();
    socketFunctionality(joinRoomInput.value);
  };

  const socketFunctionality = (roomId) => {
    const socket = io("ws://localhost:8080", {
      extraHeaders: {
        "my-custom-header": "abcd",
      },
    });

    socket.emit("joinRoom", { roomId, userName: getName() });

    socket.on("connect", () => {
      const userName = getName();
      socket.emit("serverUrlCheck", roomId);
      console.log("connected to server");
    });

    socket.on("joinedRoom", (data) => {
      console.log("joinedRoomData", data);
      joinRoomInput.value = data.roomId;
      roomCode.innerHTML = "Room Code: " + data.roomId;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];

        if (activeTab.url !== data.url) {
          chrome.tabs.update(activeTab.id, { url: data.url });
        }
        console.log(chrome.tabs.executeScript);

        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ["socket.io.min.js"],
        });

        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ["overlay.js"],
        });

        chrome.scripting.insertCSS({
          target: { tabId: activeTab.id },
          files: ["style.css"],
        });

        chrome.storage.sync.set({ socket: socket }, function () {
          console.log("socket is set to " + socket);
        });

        chrome.storage.sync.set({ roomId: roomId }, function () {
          console.log("roomId is set to " + roomId);
        });
      });
    });

    socket.on("roomNotFound", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const { url } = tabs[0];
        console.log("Room not found url", url);
        socket.emit("createRoom", { roomId, url });
      });
    });

    socket.on("roomFound", (url) => {
      if (url != Window.location) {
        Window.location.replace(url);
      }
      socket.emit("joinRoom", { roomId, url });
    });
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    if (activeTab.url.match(/.itv.com/g)) {
      console.log("ITV URL!");
      createRoomButton.addEventListener("click", () => createRoomInit());
      joinRoomButton.addEventListener("click", joinRoomInit);
    }
  });

  const injection = (socket, roomId) => {
    const container = document.createElement("div");
    const headerContainer = document.createElement("div");
    const messagesContainer = document.createElement("div");
    messagesContainer.classList.add("messages_container");
    const inputContainer = document.createElement("div");

    const input = document.createElement("input");
    input.placeholder = "Start Chatting";
    const submitButton = document.createElement("button");
    const video = document.querySelector("video");

    console.log("here", socket, roomId);

    const socketFunctionality = (roomId) => {
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
  };
}

document.addEventListener("DOMContentLoaded", init);
