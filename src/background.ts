import "webext-dynamic-content-scripts";
import addDomainPermissionToggle from "webext-permission-toggle";
import browser from "webextension-polyfill";

(async () => {
    addDomainPermissionToggle();
})();

browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        browser.tabs.create({ url: "https://ona.com" });
    }
});
// browser.runtime.setUninstallURL("https://ona.com");

export { };
