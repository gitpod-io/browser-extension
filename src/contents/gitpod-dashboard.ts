import type { PlasmoCSConfig } from "plasmo";
import browser from "webextension-polyfill";

import { Storage } from "@plasmohq/storage";

import { automaticallyUpdateEndpoint } from "~instance-hopping";

const isSiteGitpod = (): boolean => {
    return !!document.head.querySelector("meta[name=Gitpod], meta[name=Ona]");
};

export const config: PlasmoCSConfig = {
    matches: ["https://gitpod.io/*", "https://app.ona.com/*", "https://*.gitpod.cloud/*"],
};

const storage = new Storage();

if (isSiteGitpod()) {
    localStorage.setItem("extension-last-seen-active", new Date().toISOString());
    const targetElement = document.querySelector(`meta[name="extension-active"]`);
    if (targetElement) {
        targetElement.setAttribute("content", "true");
    }

    void automaticallyUpdateEndpoint(storage, browser.storage, window.location.origin);
}
