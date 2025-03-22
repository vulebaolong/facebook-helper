// chrome.tabs.create({ url: chrome.runtime.getURL("common/html/option.html") });
document.addEventListener("DOMContentLoaded", async () => {
   const input = document.querySelector(".input-focus_chat");
   const startBtn = document.querySelector(".button-start-hide_chat");
   const stopBtn = document.querySelector(".button-stop-hide_chat");

   const { chatFilterKeyword } = await chrome.storage.local.get("chatFilterKeyword");
   if (chatFilterKeyword) {
      input.value = chatFilterKeyword;
   }

   sendEvent({ action: "get-init-status" }, (res) => {
      console.log({ res });
      if (res) {
         updateButtonState(`stop`, startBtn, stopBtn);
      } else {
         updateButtonState(`start`, startBtn, stopBtn);
      }
   });

   startBtn.addEventListener("click", async () => {
      const keyword = input.value.trim();
      if (!keyword) return alert("Please type keyword");

      await chrome.storage.local.set({ chatFilterKeyword: keyword });

      sendEvent(
         {
            action: "start-filter",
            keyword,
         },
         (res) => {
            console.log({ res });
            if (res) {
               console.log("Hide Successfully");
               updateButtonState(`stop`, startBtn, stopBtn);
            } else {
               console.log("Hide Failed");
               updateButtonState(`start`, startBtn, stopBtn);
            }
         }
      );
   });

   stopBtn.addEventListener("click", () => {
      sendEvent({ action: "stop-filter" }, (res) => {
         if (res) {
            console.log("Hide Successfully");
            updateButtonState(`stop`, startBtn, stopBtn);
         } else {
            console.log("Hide Failed");
            updateButtonState(`start`, startBtn, stopBtn);
         }
      });
   });

   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "filter-restarted") {
         if(message.status) {
            updateButtonState("stop", startBtn, stopBtn);
         } else {
            updateButtonState("start", startBtn, stopBtn);
         }
      }
    });
});

function updateButtonState(active, startBtn, stopBtn) {
   if (active === "start") {
      startBtn.disabled = false;
      stopBtn.disabled = true;
   } else if (active === "stop") {
      stopBtn.disabled = false;
      startBtn.disabled = true;
   }
}

function sendEvent(payload, cb) {
   chrome.tabs.query({ url: "https://www.messenger.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
         chrome.tabs.sendMessage(tab.id, payload, (response) => {
            if (chrome.runtime.lastError) {
               console.error("❌ Lỗi gửi message:", chrome.runtime.lastError.message);
               // alert("Not content script.");
               return;
            }
            cb(response);
         });
      });
   });
}
