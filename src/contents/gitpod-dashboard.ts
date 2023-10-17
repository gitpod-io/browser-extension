import { Storage } from "@plasmohq/storage";
import type { PlasmoCSConfig } from "plasmo";
import { DEFAULT_GITPOD_ENDPOINT } from "~constants";
import { STORAGE_AUTOMATICALLY_DETECT_GITPOD, STORAGE_KEY_ADDRESS } from "~storage";
import { parseEndpoint } from "~utils/parse-endpoint";

/**
 * Checks if the current site is a Gitpod instance.
 */
const isSiteGitpod = (): boolean => {
  return !!document.head.querySelector("meta[name=Gitpod]");
}

export const config: PlasmoCSConfig = {
  matches: [
    "https://gitpod.io/*",
    "https://*.gitpod.cloud/*",
    "https://*.gitpod.dev/*"
  ],
}

const storage = new Storage();

const automaticallyUpdateEndpoint = async () => {
  if (await storage.get<boolean>(STORAGE_AUTOMATICALLY_DETECT_GITPOD) === false) {
    return;
  }

  const currentHost = window.location.host;
  if (currentHost !== new URL(DEFAULT_GITPOD_ENDPOINT).host) {
    console.log(`Gitpod extension: switching default endpoint to ${currentHost}.`)
    await storage.set(STORAGE_KEY_ADDRESS, parseEndpoint(currentHost));
  }
}

if (isSiteGitpod()) {
  sessionStorage.setItem("browser-extension-installed", "true");
  automaticallyUpdateEndpoint();
}
