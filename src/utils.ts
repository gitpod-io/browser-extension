import { ConfigProvider, DEFAULT_CONFIG } from "./config";
const browser = require("webextension-polyfill");

export function renderGitpodUrl(gitpodURL: string): string {
  const baseURL = `${window.location.protocol}//${window.location.host}`;
  return (
    `${gitpodURL}/#${baseURL}` +
    window.location.pathname +
    window.location.search
  );
}

export function isVisible(el: HTMLElement) {
  try {
    const rect = el.getBoundingClientRect();
    if (rect.height === 0 && rect.width === 0) {
      return false;
    }
    if (el.style.opacity === "0" || el.style.visibility === "hidden") {
      return false;
    }
  } catch {}
  return true;
}

export function makeOpenInPopup(a: HTMLAnchorElement): void {
  a.onclick = () =>
    !window.open(
      a.href,
      a.target,
      "menubar=no,toolbar=no,location=no,dependent"
    );
}

export async function openLink (url: string) {
  const configProvider = await ConfigProvider.create();
  const config = configProvider.getConfig();
  if (config.inNewTab) {
    browser.tabs.create({ url });
  } else {
    browser.tabs.update({ url });
  }
}

export async function openInGitpod(e: MouseEvent | KeyboardEvent | undefined) {
  const currentTab = await browser.tabs.getCurrent();
  openLink(`${DEFAULT_CONFIG.gitpodURL}/#${currentTab.url}`);

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
}
