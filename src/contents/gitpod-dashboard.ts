import type { PlasmoCSConfig } from "plasmo";
import { isSiteGitpod } from "../gitpod-dashboard/utils";

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"]
}

if (isSiteGitpod()) {
  sessionStorage.setItem("browser-extension-installed", "true");
}
