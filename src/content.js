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
      "stop-filter": () => {
         disconnectObserver();
         resetFilteredChats();
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
   const listEl = getElementList();
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
      const textContent = chat.querySelector(`span`)?.textContent || chat.textContent || "";
      const isMatch = arrTitileFilter.some((title) => textContent.includes(title));
      applyChatStyle(chat, isMatch);
   });
}

function resetFilteredChats() {
   const listEl = getElementList();
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

function getElementList() {
   const containerChat = document.querySelector('div[aria-label="Đoạn chat"]');
   if (!containerChat) return false;
   const listEl = containerChat.querySelector('div[role="list"]');
   return listEl || false;
}
