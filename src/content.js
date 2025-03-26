// zip -r ../YourExtension.zip . -x "*.DS_Store"

const arrLabelContainerChat = [
   "Chats", // English
   "Đoạn chat", // Tiếng Việt
   "聊天室", // Chinese (Simplified)
   "Chats", // Español
   "Bate-papos", // Português (Brasil)
   "Sheekeysiyo", // Português (Brasil)
   "Conversaciones", // Spanish
   "Discussions", // French
   "Chat", // Italian
   "チャット", // Japanese
   "채팅", // Korean
   "Sohbetler", // Turkish
   "Czat", // Polish
   "Чаты", // Russian
   "Rozmowy", // Czech
   "Chatear", // Catalan
   "Mensagens", // Brazilian Portuguese (common variation)
];
const selectorListChat = `div[role="list"]`;

console.log(`Content runed successfully`);
let observer = null;

initOnLoad();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   const handlers = {
      "start-filter": async () => {
         disconnectObserver();
         await startFiltering(message.arrTitileFilter);
         sendResponse(!!observer);
      },
      "stop-filter": async () => {
         disconnectObserver();
         await resetFilteredChats();
         chrome.storage.local.set({ isChatFilterRunning: false });
         sendResponse(!!observer);
      },
      "get-init-status": () => {
         chrome.storage.local.get("isChatFilterRunning", (data) => {
            sendResponse(data.isChatFilterRunning === true);
         });
      },
   };

   if (handlers[message.action]) {
      handlers[message.action]();
      return true;
   }

   return true;
});

async function initOnLoad() {
   const { isChatFilterRunning, arrTitileFilter } = await chrome.storage.local.get(["isChatFilterRunning", "arrTitileFilter"]);

   if (isChatFilterRunning && arrTitileFilter) {
      await startFiltering(arrTitileFilter);
   }

   chrome.runtime.sendMessage({
      action: "filter-restarted",
      status: !!observer,
   });
}

async function startFiltering(arrTitileFilter) {
   await chrome.storage.local.set({ isChatFilterRunning: true });
   return initObserverWithKeyword(arrTitileFilter);
}

async function initObserverWithKeyword(arrTitileFilter) {
   const listEl = await getElementList();
   if (!listEl) return false;

   filterChats(arrTitileFilter, listEl);

   observer = new MutationObserver(() => {
      filterChats(arrTitileFilter, listEl);
   });

   observer.observe(listEl, {
      childList: true,
   });

   return true;
}

function filterChats(arrTitileFilter, listEl) {
   if (!Array.isArray(arrTitileFilter)) return;
   Array.from(listEl.children).forEach((chat) => {
      const textContent = chat.textContent || "";
      const textContentLower = textContent?.toLowerCase();
      const isMatch = arrTitileFilter.some((title) => {
         const titleLower = title?.toLowerCase();
         return textContentLower.includes(titleLower);
      });
      applyChatStyle(chat, isMatch);
   });
}

async function resetFilteredChats() {
   const listEl = await getElementList();
   if (!listEl) return;

   Array.from(listEl.children).forEach((chat) => {
      applyChatStyle(chat, true);
   });
}

function applyChatStyle(chat, isVisible) {
   if (isVisible) {
      chat.style.position = "";
      chat.style.zIndex = "";
      chat.style.bottom = "";
      chat.style.opacity = "";
   } else {
      chat.style.position = "fixed";
      chat.style.zIndex = -999;
      chat.style.bottom = "100%";
      chat.style.opacity = 0;
   }
}

function disconnectObserver() {
   if (observer) {
      observer.disconnect();
      observer = null;
   }
}

async function getElementList() {
   const containerChatEl = await waitForElement(arrLabelContainerChat);
   const listChatEl = findListChat(containerChatEl);
   return listChatEl || false;
}

function findContainerChat(arrLabelContainerChat) {
   for (const label of arrLabelContainerChat) {
      const el = document.querySelector(`div[aria-label="${label}"]`);
      if (el) return el;
   }
   return null;
}

function findListChat(containerChatEl) {
   const descendants = containerChatEl.querySelectorAll("*");

   for (const el of descendants) {
      const style = window.getComputedStyle(el);
      if (style.overflowY === "scroll" || style.overflowY === "auto") {
         const child = el.children[1].children[0];
         if (child) return child;
      }
   }
   return null;
}

function waitForElement(arrLabelContainerChat) {
   return new Promise((resolve) => {
      const existing = findContainerChat(arrLabelContainerChat);
      if (existing) return resolve(existing);

      const observer = new MutationObserver(() => {
         const el = findContainerChat(arrLabelContainerChat);
         if (el) {
            observer.disconnect();
            resolve(el);
         }
      });

      observer.observe(document.body, {
         childList: true,
         subtree: true,
      });
   });
}
