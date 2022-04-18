import { IDEOptions } from "@gitpod/gitpod-protocol/lib/ide-protocol";
import * as ideOpts from "./ide-options.json"

export declare interface UrlInfo {
    host: string;
    originUrl: string;
    gitpodUrl: string;
}

export function renderGitpodUrl(gitpodURL: string): UrlInfo {
    const baseURL = `${window.location.protocol}//${window.location.host}`;
    const originUrl = baseURL + window.location.pathname + window.location.search
    return {
        originUrl,
        host: gitpodURL,
        gitpodUrl: `${gitpodURL}/#${originUrl}`,
    };
}

const referrer = "browser-extension"
export function renderGitpodCustomEditor(gpHost: string, repoUrl: string, ide: string, useLatest: boolean) {
    // TODO: make sure we are not using gitpod.io
    // since referer will been tracked and broke our tracking data
    gpHost = "https://hw-9434-open-via-url.staging.gitpod-dev.com"
    return `${gpHost}/#editor:${ide}:${useLatest ? 'latest' : ''}:${referrer}/${repoUrl}`
}

export function isVisible(el: HTMLElement) {
    try {
        const rect = el.getBoundingClientRect();
        if (rect.height === 0 && rect.width === 0) {
            return false;
        }
        if (el.style.opacity === '0' || el.style.visibility === 'hidden') {
            return false;
        }
    } catch { }
    return true;
}

export function makeOpenInPopup(a: HTMLAnchorElement): void {
    a.onclick = () => !window.open(a.href, a.target, 'menubar=no,toolbar=no,location=no,dependent');
}

export function openInPopup(url: string, target: string): void {
  !window.open(url, target, 'menubar=no,toolbar=no,location=no,dependent');
}

export const ideOptions = ideOpts as IDEOptions;

export function createElementFromHTML(str: string): HTMLElement {
    var div = <HTMLElement>document.createElement('div');
    div.innerHTML = str.trim();
    if (div.childNodes.length === 1) {
        return div.childNodes.item(0) as HTMLElement
    }
    return div;
}