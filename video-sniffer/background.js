// // 点击扩展图标时触发；主要是注入content.js
// chrome.action.onClicked.addListener(async (tab) => {
//   if (!tab.id) return;
//   console.log("【step1】tab.id=", tab.id);

//   const fullTab = await chrome.tabs.get(tab.id);
//   if (!fullTab.url) return;
//   console.log("【step2】fullTab.url=", fullTab.url);

//   if (!fullTab.url.includes("pornhub.com")) {
//     console.log("Not target domain");
//     return;
//   }
//   console.log("【step3】include target domain：", fullTab.url);

//   await chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["content.js"]
//   });
//   console.log("【step4】inject content.js success");

//   chrome.tabs.sendMessage(tab.id, {
//     type: "EXTRACT_VIDEO"
//   });
//   console.log("【step5】send message to content.js");
// });


chrome.runtime.onMessage.addListener((msg, sender) => {
  // 打印日志
  console.log("【background.js】Received message:", msg);
  if (msg.type !== "DOWNLOAD_VIDEO") return;

  fetch("http://localhost:8988/study/download/p", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(msg.payload)
  })
    .then(res => res.text())
    .then(() => {
      // 打印日志
      console.log("✅ Download request sent:", msg.payload);
      chrome.runtime.sendMessage({
        type: "DOWNLOAD_STATUS",
        success: true,
        message: "下载任务已提交"
      });
    })
    .catch(err => {
      // 打印日志
      console.error("❌ Failed to fetch local server:", err);
      chrome.runtime.sendMessage({
        type: "DOWNLOAD_STATUS",
        success: false,
        message: err.message
      });
    });
});