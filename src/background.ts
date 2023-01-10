const browser = require("webextension-polyfill");
import { ConfigProvider, DEFAULT_CONFIG } from "./config";
import { openLink } from "./utils";

async function gitpodifyCurrentTab() {
  try {
    // add a dummy div element to indicate that gitpodify.bundle.js was injected by a user click on the gitpod icon
    browser.scripting.insertCSS({
      css: `document.body.innerHTML += '<div style=\"display: none;\" id=\"gitpod-extension-icon-clicked\"></div>'`,
    });
    browser.scripting.executeScript({
      files: ["dist/bundles/gitpodify.bundle.js"],
    });
  } catch {
    try {
      const configProvider = await ConfigProvider.create();
      const config = configProvider.getConfig();
      openLink(config.gitpodURL);
    } catch {
      openLink(DEFAULT_CONFIG.gitpodURL);
    }
  }
}

browser.action.onClicked.addListener(gitpodifyCurrentTab);

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
   openLink("https://www.gitpod.io/extension-activation?track=true");
  }
});
browser.runtime.setUninstallURL(
  "https://www.gitpod.io/extension-uninstall?track=true"
);
