import { browser } from "webextension-polyfill-ts";
import 'webext-dynamic-content-scripts';
import addDomainPermissionToggleMv2 from "webext-domain-permission-toggle";
import addDomainPermissionToggleMv3 from "~utils/domain-accept";

(async () => {
    if (browser.runtime.getManifest().manifest_version === 2) {
        addDomainPermissionToggleMv2();
    } else {
        addDomainPermissionToggleMv3();
    }
})();

browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        browser.tabs.create({ url: "https://www.gitpod.io/extension-activation?track=true" });
    }
});
browser.runtime.setUninstallURL("https://www.gitpod.io/extension-uninstall?track=true");

export { }
