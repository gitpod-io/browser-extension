import type { PlasmoCSConfig } from "plasmo";
import { isSiteGitpod } from "../button/button-contributions";

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"]
}

if (isSiteGitpod()) {
  sessionStorage.setItem("browser-extension-installed", "true");
}
