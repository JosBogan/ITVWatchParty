function init() {
  const initialiserButton = document.querySelector("#initialiser_button");

  const createRoom = (activeTab) => {
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
  };

  const redirectToItv = () => {
    const url = "http://itv.com/";
    chrome.tabs.create({ url });
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    if (activeTab.url.match(/.itv.com/g)) {
      console.log("ITV URL!");
      initialiserButton.addEventListener("click", () => createRoom(activeTab));
    } else {
      console.log("Not on an ITV url, redirecting to ITV.com");
      initialiserButton.addEventListener("click", redirectToItv);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
