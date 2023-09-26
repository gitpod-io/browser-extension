import type { PlasmoCSConfig } from "plasmo";
import { Storage } from "@plasmohq/storage"
import { isSiteGitpod } from "../button/button-contributions";
import { STORAGE_KEY_ADDRESS } from "~storage";

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"]
}

if (isSiteGitpod()) {
  sessionStorage.setItem("browser-extension-installed", "true");
  (async () => {
    const storage = new Storage();
    const gitpodEndpoint = await storage.getItem(STORAGE_KEY_ADDRESS);
    const host = new URL(gitpodEndpoint).host;
    const thisPageHost = window.location.host;
    if (host === thisPageHost) {
      sessionStorage.setItem("browser-extension-active", "true");
    } else {
      sessionStorage.removeItem("browser-extension-active");
    }
  })();
}

