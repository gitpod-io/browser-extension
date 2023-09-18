import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo";
import cssText from "data-text:../button/button.css"
import { buttonContributions, type ButtonContributionParams } from "../button/button-contributions";
import { GitpodButton } from "../button/button";
import { type ReactElement } from "react";
import React from "react";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

class ButtonContributionManager {

  private buttons = new Map<string, React.JSX.Element>();
  private active: {
    contribution: ButtonContributionParams,
    anchor: HTMLElement,
  }

  constructor(private contributions: ButtonContributionParams[]) {
    for (const contribution of this.contributions) {
      const containerId = this.getContainerId(contribution);
      if (!this.buttons.has(containerId)) {
        this.buttons.set(containerId, <GitpodButton key={containerId} application={contribution.application} additionalClassNames={contribution.additionalClassNames} />);
      }
    }
  }

  private getContainerId(contribution: ButtonContributionParams) {
    return "gp-btn-cnt-" + contribution.application + contribution.additionalClassNames?.map(c => "-" + c)?.join("");
  }

  private updateActive(active?: { contribution: ButtonContributionParams, anchor: HTMLElement }) {
    if (this.active && this.active.contribution.id !== active?.contribution.id) {
      const element = document.getElementById(this.active.contribution.id);
      if (element) {
        element.remove();
      }
    }
    this.active = active;
  }

  public getInlineAnchor(): HTMLElement | null {
    for (const contribution of this.contributions) {
      const isActive = this.isActive(contribution);
      if (isActive) {
        if (this.active?.contribution.id === contribution.id &&
            this.active?.anchor?.isConnected) {
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

  private isActive(contrib: ButtonContributionParams) {
    if (contrib.match && !contrib.match.test(window.location.href)) {
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
}

export default () => {
  return manager.getElement();
}


function createElement(name: keyof HTMLElementTagNameMap, styles?: Partial<CSSStyleDeclaration>) {
  const element = document.createElement(name);
  if (styles) {
    for (const key in styles) {
      element.style[key] = styles[key];
    }
  }
  return element;
}