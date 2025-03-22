console.log(`Content runed successfully`);

let observer = null;

(async () => {
   const { isChatFilterRunning, chatFilterKeyword } = await chrome.storage.local.get(["isChatFilterRunning", "chatFilterKeyword"]);

   if (isChatFilterRunning && chatFilterKeyword) {
      await initObserverWithKeyword(chatFilterKeyword);
   }
   chrome.runtime.sendMessage({
      action: "filter-restarted",
      status: observer,
   });
})();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   if (message.action === "start-filter") {
      disconnectObserver();
      initObserverWithKeyword(message.keyword).then(() => {
         chrome.storage.local.set({ isChatFilterRunning: true });
         sendResponse(!!observer);
      });
      return true;
   }

   if (message.action === "stop-filter") {
      disconnectObserver();

      resetFilteredChats();

      chrome.storage.local.set({ isChatFilterRunning: false });
      sendResponse(!!observer);
      return true;
   }

   if (message.action === "get-init-status") {
      chrome.storage.local.get("isChatFilterRunning", (data) => {
         sendResponse(data.isChatFilterRunning === true);
      });
      return true;
   }

   return true;
});

window.onload = function () {};

function filterChats(keyword, containerChat) {
   console.log(`hide`);
   Array.from(containerChat.children).forEach((chat) => {
      const textContent = chat.textContent || "";
      const isMatch = textContent.includes(keyword);
      if (!isMatch) {
         chat.style.position = "fixed";
         chat.style.zIndex = -999;
         chat.style.bottom = `100%`;
         chat.style.opacity = 0;
      } else {
         chat.style.position = "unset";
         chat.style.zIndex = "unset";
         chat.style.bottom = `unset`;
         chat.style.opacity = `unset`;
      }
   });
}

function resetFilteredChats() {
   const containerChat = document.querySelector('div[aria-label="Đoạn chat"]');
   if (containerChat) {
      // console.log("Found containerChat:", containerChat);
   } else {
      // console.log("Not Found containerChat.");
      return false;
   }

   const list = containerChat.querySelector('div[role="list"]');
   if (list) {
      // console.log("Found list:", list);
   } else {
      // console.log("Not Found list.");
      return false;
   }

   Array.from(list.children).forEach((chat) => {
      chat.style.position = "";
      chat.style.zIndex = "";
      chat.style.bottom = "";
      chat.style.opacity = "";
   });
}

async function waitForElement(selector, intervalSeconds = 1, timeoutSeconds = 10) {
   const element = document.querySelector(selector);
   if (element) return element;

   return new Promise((resolve) => {
      const intervalMs = intervalSeconds * 1000;
      const timeoutMs = timeoutSeconds * 1000;
      let elapsed = 0;

      const interval = setInterval(() => {
         console.log(`waiting for`);
         const element = document.querySelector(selector);
         if (element) {
            clearInterval(interval);
            resolve(element);
         } else {
            elapsed += intervalMs;
            if (elapsed >= timeoutMs) {
               clearInterval(interval);
               // console.warn(`Not Found Element "${selector}" after ${timeoutSeconds}s.`);
               resolve(false);
            }
         }
      }, intervalMs);
   });
}

async function initObserverWithKeyword(keyword) {
   const containerChat = await waitForElement('div[aria-label="Đoạn chat"]', 1, 10);

   if (containerChat) {
      // console.log("Found containerChat:", containerChat);
   } else {
      // console.log("Not Found containerChat.");
      return false;
   }

   const list = containerChat.querySelector('div[role="list"]');
   if (list) {
      // console.log("Found list:", list);
   } else {
      // console.log("Not Found list.");
      return false;
   }

   // console.log(`Count chat: ${list.childElementCount}`);

   filterChats(keyword, list);

   observer = new MutationObserver((mutationsList, observer) => {
      filterChats(keyword, list);
   });

   observer.observe(list, {
      childList: true, // theo dõi thêm / xóa phần tử con
      // subtree: true, // theo dõi cả các phần tử con lồng nhau
      // characterData: true, // theo dõi thay đổi nội dung text
   });

   return true;
}

function disconnectObserver() {
   if (observer) {
      observer.disconnect();
      observer = null;
   }
}
