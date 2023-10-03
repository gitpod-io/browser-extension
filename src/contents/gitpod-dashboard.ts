import type { PlasmoCSConfig } from "plasmo";
import { Storage } from "@plasmohq/storage";
import { STORAGE_AUTOMATICALLY_DETECT_GITPOD, STORAGE_KEY_ADDRESS } from "~storage";
import { parseEndpoint } from "~utils/parse-endpoint";
import { DEFAULT_GITPOD_ENDPOINT } from "~constants";

/**
 * Checks if the current site is a Gitpod instance.
 */
const isSiteGitpod = (): boolean => {
  return !!document.head.querySelector("meta[name=Gitpod]");
}

export const config: PlasmoCSConfig = {
  matches: ["https://gitpod.io/*"],
}

const storage = new Storage();

const automaticallyUpdateEndpoint = async () => {
  if (await storage.get<boolean>(STORAGE_AUTOMATICALLY_DETECT_GITPOD) === false) {
    return;
  }
  
  const currentUserSetEndpoint = await storage.get(STORAGE_KEY_ADDRESS);
  if (!currentUserSetEndpoint || currentUserSetEndpoint === DEFAULT_GITPOD_ENDPOINT) {
    const currentHost = window.location.host;
    if (currentHost !== new URL(DEFAULT_GITPOD_ENDPOINT).host) {
      console.log(`Gitpod extension: switching default endpoint to ${currentHost}.`)
      await storage.set(STORAGE_KEY_ADDRESS, parseEndpoint(currentHost));
    }
  }
}
if (isSiteGitpod()) {
  sessionStorage.setItem("browser-extension-installed", "true");
  automaticallyUpdateEndpoint();
}
