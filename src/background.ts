import browser from "webextension-polyfill";

import "webext-dynamic-content-scripts";

import addDomainPermissionToggle from "webext-permission-toggle";

(async () => {
    addDomainPermissionToggle();
})();

browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        browser.tabs.create({ url: "https://ona.com" });
    }
});
// browser.runtime.setUninstallURL("https://ona.com");

export {};
