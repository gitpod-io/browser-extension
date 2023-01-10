var browser = require("webextension-polyfill");
import * as domloaded from "dom-loaded";

import "../css/gitpodify.css";
import { ConfigProvider } from "./config";
import { Injector } from "./injectors/injector";
import { InjectorProvider } from "./injectors/injector-provider";
import { openLink } from "./utils";

let initChain: Promise<void> = Promise.resolve();
let isInstalling: boolean = false;
let observer: MutationObserver | undefined;

/**
 * This method is called on _every_ page the extension is statically registered for (cmp. manifest.json/content_scripts/matches)
 * or on the active tab when the user clicked on the Gitpod icon.
 */
const init = async (injectedByUserClick: boolean = false) => {
  const configProvider = await ConfigProvider.create();
  const config = configProvider.getConfig();

  // Tell every page that looks like a Gitpod installation that the browser extension is installed!
  const gitpodExtensionCheckElement = document.getElementById(
    "ExtensionCheck_GitpodBrowserExtension"
  );
  if (gitpodExtensionCheckElement) {
    gitpodExtensionCheckElement.innerHTML = "installed";
    if (injectedByUserClick) {
      openLink(config.gitpodURL);
    }
    // This page is a Gitpod page. We are done.
    return;
  }

  // Get the first injector that canHandleCurrentPage()
  const injectorProvider = new InjectorProvider(configProvider);
  const injector = injectorProvider.findInjectorForCurrentPage();
  if (!injector) {
    // We do not have an injector for this page. We just open Gitpod.
    if (injectedByUserClick) {
      openLink(config.gitpodURL);
    }
    return;
  }

  //   BREAKING, TODO: Fix this
  if (injectedByUserClick) {
    // User clicked on the Gitpod extension icon. We open the Gitpod with this page as context.
    try {
      const currentTab = await browser.tabs.getCurrent();
      openLink(`${config.gitpodURL}/#${currentTab.url}`);
    } catch (e) {
      console.error(e)
      openLink(config.gitpodURL);
    }
  }

  // Perform the actual, initial injection
  await injector.inject();
  await domloaded;

  // Observe and update on DOM changes
  updateOnDOMChanges(injector);

  // Listen for config changes
  configProvider.on(() => {
    reinit();
    configProvider.dispose();
  });
};

const injectedByUserClick = (): boolean => {
  // This script has been injected by a user click on the Gitpod icon when the following element exists.
  const div = document.getElementById("gitpod-extension-icon-clicked");
  if (div) {
    div.remove();
    return true;
  }
  return false;
};

const updateOnDOMChanges = (injector: Injector) => {
  observer = new MutationObserver(() => {
    if (!injector.checkIsInjected() && !isInstalling) {
      isInstalling = true;
      injector.update().then(() => (isInstalling = false));
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
};

/**
 * This method is called on config changes. It resets the state to initial and re-runs init
 */
const reinit = () => {
  initChain
    .then(async () => {
      isInstalling = false;
      if (observer) {
        observer.disconnect();
        observer = undefined;
      }
    })
    .then(() => init());
};

initChain = init(injectedByUserClick());
