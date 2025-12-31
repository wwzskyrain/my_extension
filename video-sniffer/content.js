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

  const m3u8Url = findHighestQualityUrl(videoUrls);
  // 打印最高质量URL
  console.log("【contents.js】Highest quality URL:", m3u8Url);

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

// 寻找最高质量的URL
function findHighestQualityUrl(videoUrls) {

  if (videoUrls.length === 0) {
    console.warn("No videoUrl found");
    return;
  }

  // 假设URL中包含分辨率信息，例如 "1080P"、"720P"、"480P" 等
  // 如果有1080P，优先选择1080P
  const url1080P = videoUrls.filter(url => url.includes("1080P"));
  if (url1080P.length > 0) {
    return url1080P[0];
  }
  // 如果没有1080P，选择720P
  const url720P = videoUrls.filter(url => url.includes("720P"));
  if (url720P.length > 0) {
    return url720P[0];
  }
  // 如果没有720P，选择480P
  const url480P = videoUrls.filter(url => url.includes("480P"));
  if (url480P.length > 0) {
    return url480P[0];
  }
  // 兜底，返回第一个URL
  
  return videoUrls[0];
}
