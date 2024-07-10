import browser from "webextension-polyfill";

import "webext-dynamic-content-scripts";

import addDomainPermissionToggle from "webext-permission-toggle";

(async () => {
    addDomainPermissionToggle();
})();

browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        browser.tabs.create({ url: "https://www.gitpod.io/extension-activation?track=true" });
    }
});
browser.runtime.setUninstallURL("https://www.gitpod.io/extension-uninstall?track=true");

export {};
