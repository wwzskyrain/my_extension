const statusEl = document.getElementById("status");
const btn = document.getElementById("downloadBtn");

btn.addEventListener("click", async () => {
    statusEl.textContent = "正在分析页面...";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
        statusEl.textContent = "❌ 无法获取当前页面";
        return;
    }

    const fullTab = await chrome.tabs.get(tab.id);
    if (!fullTab.url) {
        console.log("fullTab.url=", fullTab.url);
        statusEl.textContent = "❌ 无法获取当前页面 URL";
        return;
    }


    if (!fullTab.url.includes("pornhub.com")) {
        console.log("Not target domain");
        statusEl.textContent = "非P站页面，无法提取视频";
        return;
    }

    // 注入 content.js
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });

    // 告诉 content.js 开始提取
    chrome.tabs.sendMessage(tab.id, {
        type: "EXTRACT_VIDEO"
    });

    statusEl.textContent = "已发送解析请求...";
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "DOWNLOAD_STATUS") return;

  if (msg.success) {
    statusEl.textContent = "✅ " + msg.message;
  } else {
    statusEl.textContent = "❌ " + msg.message;
  }
});