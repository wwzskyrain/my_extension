console.log("🔥 content.js loaded");
function extractTitle() {
  return document.title || "unknown";
}

function extractVideoUrls() {
  const urls = [];

  const scripts = document.querySelectorAll("script");
  const regex = /"videoUrl"\s*:\s*"([^"]+)"/g;

  scripts.forEach(script => {
    const text = script.textContent;
    if (!text) return;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const rawUrl = match[1];
      const decodedUrl = rawUrl.replace(/\\\//g, "/");
      urls.push(decodedUrl);
    }
  });

  return urls;
}

// 监听来自background.js的消息；主要是解析页面(即html内容)中的title和videoUrl
chrome.runtime.onMessage.addListener((msg) => {
  // 打印日志
  console.log("【contents.js】Received message:", msg);
  if (msg.type !== "EXTRACT_VIDEO") {
    return;
  }

  const title = extractTitle();
  console.log("【contents.js】extract Title success， title:", title);

  const videoUrls = extractVideoUrls();
  console.log("【contents.js】extract VideoUrls success， videoUrls:", videoUrls);

  console.log("Title:", title);
  console.log("Video URLs:", videoUrls);

  if (videoUrls.length === 0) {
    console.warn("No videoUrl found");
    return;
  }
  // 打印所有视频URL，每行一个
  videoUrls.forEach(url => console.log(url));

  // 默认选最高质量（第一个通常是最高）
  const m3u8Url = videoUrls[0];

  // 发送消息到background.js，在background中下载视频
  sendToBackground({
    title,
    m3u8Url
  });
});

function sendToBackground(data) {
  // 发送消息到background.js
  console.log("【contents.js】sendToBackground， data:", data);
  chrome.runtime.sendMessage({
    type: "DOWNLOAD_VIDEO",
    payload: data
  });
}