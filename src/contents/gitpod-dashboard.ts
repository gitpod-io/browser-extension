import type { PlasmoCSConfig } from "plasmo";

/**
 * Checks if the current site is a Gitpod instance.
 */
const isSiteGitpod = (): boolean => {
  return !!document.head.querySelector("meta[name=Gitpod]");
}

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"]
}

if (isSiteGitpod()) {
  sessionStorage.setItem("browser-extension-installed", "true");
}
