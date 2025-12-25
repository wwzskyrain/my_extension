const stats = {
    script: 0,
    xhr: 0,
    fetch: 0,
    image: 0,
    stylesheet: 0,
    font: 0,
    media: 0,
    other: 0
  };
  
//   监听每一个web请求，并统计器url类型。
  chrome.webRequest.onCompleted.addListener(
    (details) => {
      const type = details.type || "other";
      if (stats[type] !== undefined) {
        stats[type]++;
      } else {
        stats.other++;
      }
    },
    { urls: ["<all_urls>"] }
  );
  
//  监听“GET_STATS”消息，并发送stats
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "GET_STATS") {
      sendResponse(stats);
    }
  });

// 打印每一个url.
//   chrome.webRequest.onCompleted.addListener(
//     (details) => {
//       console.log(details.type, details.url);
//     },
//     { urls: ["<all_urls>"] }
//   );

// 插件正确加载后打印该日志
  console.log("Net Inspector background started");