import { Storage } from "@plasmohq/storage";
import type { PlasmoCSConfig } from "plasmo";
import { STORAGE_AUTOMATICALLY_DETECT_GITPOD, STORAGE_KEY_ADDRESS } from "~storage";
import { parseEndpoint } from "~utils/parse-endpoint";

/**
 * Checks if the current site is a Gitpod instance.
 */
const isSiteGitpod = (): boolean => {
    return !!document.head.querySelector("meta[name=Gitpod]");
};

export const config: PlasmoCSConfig = {
    matches: ["https://gitpod.io/*", "https://app.ona.com/*", "https://*.gitpod.cloud/*"],
};

const storage = new Storage();

const automaticallyUpdateEndpoint = async () => {
    if ((await storage.get<boolean>(STORAGE_AUTOMATICALLY_DETECT_GITPOD)) !== true) {
        return;
    }

    const currentHost = window.location.host;
    const currentlyStoredEndpoint = await storage.get<string>(STORAGE_KEY_ADDRESS);
    if (!currentlyStoredEndpoint || new URL(currentlyStoredEndpoint).host !== currentHost) {
        console.log(`Gitpod extension: switching default endpoint to ${currentHost}.`);
        await storage.set(STORAGE_KEY_ADDRESS, parseEndpoint(window.location.origin));
    }
};

if (isSiteGitpod()) {
    localStorage.setItem("extension-last-seen-active", new Date().toISOString());
    const targetElement = document.querySelector(`meta[name="extension-active"]`);
    if (targetElement) {
        targetElement.setAttribute("content", "true");
    }

    automaticallyUpdateEndpoint();
}
