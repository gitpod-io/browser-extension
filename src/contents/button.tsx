import cssText from "data-text:../button/button.css";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo";
import React, { type ReactElement } from "react";

import { EVENT_CURRENT_URL_CHANGED } from "~constants";

import { GitpodButton } from "../button/button";
import { buttonContributions, isSiteSuitable, type ButtonContributionParams } from "../button/button-contributions";

// keep in sync with DEFAULT_HOSTS in src/button/button-contributions.ts
export const config: PlasmoCSConfig = {
    matches: ["https://github.com/*", "https://gitlab.com/*", "https://bitbucket.org/*", "https://dev.azure.com/*"],
};

export const getStyle = () => {
    const style = document.createElement("style");
    style.textContent = cssText;
    return style;
};

class ButtonContributionManager {
    private buttons = new Map<string, React.JSX.Element>();
    private active: {
        contribution: ButtonContributionParams;
        anchor: HTMLElement;
    };

    private currentHref = window.location.href;

    _disabled = false;

    constructor(private contributions: ButtonContributionParams[]) {
        if (!this._disabled) {
            const isSuitable = isSiteSuitable();
            if (!isSuitable) {
                this._disabled = true;
            }
        }

        for (const contribution of this.contributions) {
            const containerId = this.getContainerId(contribution);
            if (!this.buttons.has(containerId)) {
                this.buttons.set(
                    containerId,
                    <GitpodButton
                        key={containerId}
                        application={contribution.application}
                        additionalClassNames={contribution.additionalClassNames}
                        urlTransformer={contribution.urlTransformer}
                    />,
                );
            }
        }
    }

    private getContainerId(contribution: ButtonContributionParams) {
        return `gp-btn-cnt-${contribution.application}${contribution.additionalClassNames?.map((c) => "-" + c)?.join("")}`;
    }

    private updateActive(active?: { contribution: ButtonContributionParams; anchor: HTMLElement }) {
        if (this.active && this.active.contribution.id !== active?.contribution.id) {
            const element = document.getElementById(this.active.contribution.id);
            if (element) {
                element.remove();
            }
        }
        this.active = active;
    }

    public getInlineAnchor(): HTMLElement | null {
        if (this._disabled) {
            return null;
        }

        if (this.currentHref !== window.location.href) {
            this.currentHref = window.location.href;
            const event = new CustomEvent(EVENT_CURRENT_URL_CHANGED);
            document.dispatchEvent(event);
        }

        for (const contribution of this.contributions) {
            const isActive = this.isActive(contribution);
            if (isActive) {
                if (this.active?.contribution.id === contribution.id && this.active?.anchor?.isConnected) {
                    // do nothing
                    return null;
                } else {
                    // update
                    const anchor = this.installAnchor(contribution);
                    if (anchor) {
                        this.updateActive({
                            contribution,
                            anchor,
                        });
                        return anchor;
                    }
                }
            }
        }
        this.updateActive(undefined);
        return null;
    }

    public getElement(): ReactElement | null {
        if (!this.active) {
            return null;
        }
        return this.buttons.get(this.getContainerId(this.active.contribution));
    }

    /**
     * Checks if the contribution applies to the current page.
     */
    private isActive(contrib: ButtonContributionParams) {
        if (typeof contrib.match === "function" && !contrib.match()) {
            return false;
        } else if (typeof contrib.match === "object" && !contrib.match.test(window.location.href)) {
            return false;
        }
        const parent = this.lookupElement(contrib.selector);
        if (parent === null) {
            return false;
        }
        return true;
    }

    private lookupElement(path: string): HTMLElement | null {
        if (!path) {
            return null;
        }
        if (path.startsWith("xpath:")) {
            const xpath = path.substring("xpath:".length);
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue as HTMLElement;
        } else {
            return document.querySelector(path);
        }
    }

    private installAnchor(contrib: ButtonContributionParams) {
        const parent = this.lookupElement(contrib.selector);
        if (parent === null) {
            return null;
        }
        const containerConfig = contrib.containerElement;
        let container: HTMLElement;
        if (containerConfig === null) {
            container = createElement("div");
        } else {
            container = createElement(containerConfig.type, containerConfig.props);
        }
        container.id = contrib.id;
        const before = this.lookupElement(contrib.insertBefore);

        if (contrib.manipulations) {
            for (const manipulation of contrib.manipulations) {
                const element = this.lookupElement(manipulation.element);
                if (element) {
                    if (manipulation.remove) {
                        element.classList.remove(manipulation.remove);
                    }
                    if (manipulation.add) {
                        element.classList.add(manipulation.add);
                    }
                    if (element instanceof HTMLElement && manipulation.style) {
                        for (const key in manipulation.style) {
                            element.style[key] = manipulation.style[key];
                        }
                    }
                }
            }
        }
        // make sure we manipulate the dom after applying any selectors.
        if (before) {
            parent.insertBefore(container, before);
        } else {
            parent.appendChild(container);
        }

        // plasmo adds the element as a sibling, so we create a dummy element within the container and point to that.
        const dummy = createElement("div");
        dummy.style.display = "none";
        container.appendChild(dummy);

        return dummy;
    }

    public getContributions() {
        return this.contributions;
    }
}

const manager = new ButtonContributionManager(buttonContributions);

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
    return manager.getInlineAnchor();
};

export default () => {
    return manager.getElement();
};

function createElement(name: keyof HTMLElementTagNameMap, styles?: Partial<CSSStyleDeclaration>) {
    const element = document.createElement(name);
    if (styles) {
        for (const key in styles) {
            element.style[key] = styles[key];
        }
    }
    return element;
}
