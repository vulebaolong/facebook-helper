// chrome.tabs.create({ url: chrome.runtime.getURL("common/html/option.html") });
const mesErrorConnect = `Unable to connect to Facebook. Please refresh (F5) the Messenger page and try again.`;

document.addEventListener("DOMContentLoaded", async () => {
   const textareaEl = document.querySelector(".textarea-focus_chat");
   const statusEl = document.querySelector(".status-focus_chat");
   const startBtn = document.querySelector(".button-start-hide_chat");
   const stopBtn = document.querySelector(".button-stop-hide_chat");

   textareaEl.addEventListener("blur", () => {
      const keyword = textareaEl.value.trim();
      if (!keyword) return;
      const arrTitileFilter = getArrTitleFromText(keyword);
      chrome.storage.local.set({ arrTitileFilter });
   });

   textareaEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
         setTextareaHeightByLines(textareaEl, textareaEl.value.split("\n").length + 1);
         setTimeout(() => {
            textareaEl.scrollTop = textareaEl.scrollHeight;
          }, 0);
      }
   });

   textareaEl.addEventListener("input", () => {
      sendStop((res) => {
         updateButtonState(res ? "stop" : "start", startBtn, stopBtn);
      });
   });

   const { arrTitileFilter } = await chrome.storage.local.get("arrTitileFilter");
   if (Array.isArray(arrTitileFilter)) {
      textareaEl.value = getTextTitleFromArr(arrTitileFilter);
      setTextareaHeightByLines(textareaEl, arrTitileFilter.length);
   }

   sendEvent(
      { action: "get-init-status" },
      (res) => {
         statusEl.textContent = "";
         updateButtonState(res ? "stop" : "start", startBtn, stopBtn);
      },
      (err, payload) => {
         if (payload.action === "get-init-status" && statusEl) {
            statusEl.textContent = mesErrorConnect;
            statusEl.style.color = "red";
         }
      }
   );

   startBtn.addEventListener("click", async () => {
      const keyword = textareaEl.value.trim();
      if (!keyword) return alert("Please type keyword");
      const arrTitileFilter = getArrTitleFromText(keyword);
      chrome.storage.local.set({ arrTitileFilter });
      sendStart(arrTitileFilter, (res) => {
         updateButtonState(res ? "stop" : "start", startBtn, stopBtn);
      });
   });

   stopBtn.addEventListener("click", () => {
      sendStop((res) => {
         updateButtonState(res ? "stop" : "start", startBtn, stopBtn);
      });
   });

   chrome.runtime.onMessage.addListener((message) => {
      if (statusEl) statusEl.textContent = "";
      if (message.action === "filter-restarted") {
         updateButtonState(message.status ? "stop" : "start", startBtn, stopBtn);
      }
   });
});

function updateButtonState(active, startBtn, stopBtn) {
   const isStart = active === "start";
   startBtn.disabled = !isStart;
   stopBtn.disabled = isStart;
}

function sendEvent(payload, cb, cbError) {
   chrome.tabs.query({ url: "https://www.messenger.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
         chrome.tabs.sendMessage(tab.id, payload, (response) => {
            if (chrome.runtime.lastError) {
               if (typeof cbError === "function") cbError(chrome.runtime.lastError, payload);
               return;
            }
            if (typeof cb === "function") cb(response);
         });
      });
   });
}

function sendStart(arrTitileFilter, cb) {
   sendEvent({ action: "start-filter", arrTitileFilter }, cb);
}

function sendStop(cb) {
   sendEvent({ action: "stop-filter" }, cb);
}

function getArrTitleFromText(textTitle) {
   return typeof textTitle === "string"
      ? textTitle
           .split("\n")
           .map((t) => t.trim())
           .filter(Boolean)
      : [];
}

function getTextTitleFromArr(arrTitle) {
   return Array.isArray(arrTitle) ? arrTitle.join("\n") : "";
}

function setTextareaHeightByLines(textarea, lineCount) {
   const style = window.getComputedStyle(textarea);
   const paddingTop = parseFloat(style.paddingTop);
   const paddingBottom = parseFloat(style.paddingBottom);
   const lineHeight = 1.5;
   const maxLines = 5;
   const lines = Math.min(lineCount, maxLines);
   textarea.style.height = `calc(${lines * lineHeight}em + ${paddingTop + paddingBottom}px)`;
}

function addLines(textarea) {
   const lineHeight = 1.5;
   const lineHeightPx = lineHeight * parseFloat(getComputedStyle(textarea).fontSize);
   const maxLines = 5;

   const style = window.getComputedStyle(textarea);
   const paddingTop = parseFloat(style.paddingTop);
   const paddingBottom = parseFloat(style.paddingBottom);

   const currentHeight = parseFloat(style.height) - (paddingTop + paddingBottom);
   const currentLines = Math.round(currentHeight / lineHeightPx);

   const newLines = Math.min(currentLines + 1, maxLines);
   const newHeight = newLines * lineHeightPx + paddingTop + paddingBottom;

   textarea.style.height = `${newHeight}px`;
}
