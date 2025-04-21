/* SPDX‑License‑Identifier: MIT */
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'updateConfig') {
    chrome.tabs.query({}, tabs =>
      tabs.forEach(t => chrome.tabs.sendMessage(t.id, msg))
    );
  }
});
