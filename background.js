// Background service worker — keeps the extension alive and forwards messages if needed.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Email Harvester installed.");
});
