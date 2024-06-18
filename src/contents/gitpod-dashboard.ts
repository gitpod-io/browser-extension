import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

import { DEFAULT_GITPOD_ENDPOINT } from "~constants";
import { STORAGE_AUTOMATICALLY_DETECT_GITPOD, STORAGE_KEY_ADDRESS } from "~storage";
import { parseEndpoint } from "~utils/parse-endpoint";

/**
 * Checks if the current site is a Gitpod instance.
 */
const isSiteGitpod = (): boolean => {
    return !!document.head.querySelector("meta[name=Gitpod]");
};

export const config: PlasmoCSConfig = {
    matches: ["https://gitpod.io/*", "https://*.gitpod.cloud/*"],
};

const storage = new Storage();

const automaticallyUpdateEndpoint = async () => {
    if ((await storage.get<boolean>(STORAGE_AUTOMATICALLY_DETECT_GITPOD)) === false) {
        return;
    }

    const currentHost = window.location.host;
    if (currentHost !== new URL(DEFAULT_GITPOD_ENDPOINT).host) {
        const currentlyStoredEndpoint = await storage.get<string>(STORAGE_KEY_ADDRESS);
        if (
            (currentlyStoredEndpoint && new URL(currentlyStoredEndpoint).host !== currentHost) ||
            !currentlyStoredEndpoint
        ) {
            console.log(`Gitpod extension: switching default endpoint to ${currentHost}.`);
            await storage.set(STORAGE_KEY_ADDRESS, parseEndpoint(currentHost));
        }
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
