// 当插件图标被点击时，就会发送发送“GET_STATS”消息（到background.js)，并收到stats从而打印stats。
chrome.runtime.sendMessage({ type: "GET_STATS" }, (stats) => {
    document.getElementById("output").textContent =
      JSON.stringify(stats, null, 2);
  });

  console.log("popup loaded");