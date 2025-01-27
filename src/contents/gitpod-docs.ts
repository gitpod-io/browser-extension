import type { PlasmoCSConfig } from "plasmo";

import { Storage } from "@plasmohq/storage";

import { DEFAULT_GITPOD_ENDPOINT } from "~constants";
import { STORAGE_KEY_ADDRESS } from "~storage";

export const config: PlasmoCSConfig = {
    matches: ["https://www.gitpod.io/*"],
};

const storage = new Storage();

const rewriteURLs = async () => {
    const gitpodEndpoint = (await storage.get<string>(STORAGE_KEY_ADDRESS)) ?? DEFAULT_GITPOD_ENDPOINT;
    if (gitpodEndpoint === DEFAULT_GITPOD_ENDPOINT) {
        // no-op
        console.log("Gitpod extension: no endpoint set.");
        return;
    }
    const gitpodHost = new URL(gitpodEndpoint).host;

    rewriteText(document.body, gitpodHost);

    // Get all elements with hrefs
    const elements = document.querySelectorAll("a[href]");
    elements.forEach((element) => {
        // Check for href attribute
        if (element.hasAttribute("href")) {
            const href = element.getAttribute("href");
            console.log("Checking href:", href);
            if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
                try {
                    if (!URL.canParse(href)) return; // relative URLs
                    const url = new URL(href);
                    if (url.host !== "gitpod.io") return;
                    url.host = gitpodHost;
                    element.setAttribute("href", url.toString());
                } catch (e) {
                    console.error("Invalid URL:", href);
                }
            }
        }
    });
};

const rewriteText = (node: Node, newHost: string) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const pattern = /gitpod\.io\/#/g;
        if (pattern.test(node.textContent)) {
            node.textContent = node.textContent.replace(pattern, `${newHost}/#`);
        }
    }

    // Recursively process child nodes
    node.childNodes.forEach((child) => rewriteText(child, newHost));
};

if (document.readyState === "complete") {
    console.log("Gitpod extension: rewriting URLs.");

    const pageDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (pageDesc.content.startsWith("Gitpod Documentation")) {
        rewriteURLs();

        const observer = new MutationObserver(rewriteURLs);
        const observerConfig = {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["href"],
        };
        observer.observe(document.body, observerConfig);
    }
}
