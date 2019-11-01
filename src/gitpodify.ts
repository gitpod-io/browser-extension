import * as domloaded from 'dom-loaded';

import "../css/gitpodify.css"
import { ConfigProvider } from './config';
import { Injector } from './injectors/injector';
import { InjectorProvider } from './injectors/injector-provider';

let initChain: Promise<void> = Promise.resolve();
let isInstalling: boolean = false;
let observer: MutationObserver | undefined;

/**
 * This method is called on _every_ page the extension is statically registered for (_all_ at the moment, cmp. manifest.json/content_scripts/matches)
 */
const init = async () => {
    const configProvider = await ConfigProvider.create();

    // Tell every page that looks like a Gitpod installation that the browser extension is installed!
	const checkElement = document.getElementById('ExtensionCheck_GitpodBrowserExtension');
	if (checkElement){
		checkElement.innerHTML = "installed";
	}

    // Apply configurable domain filter
    const config = configProvider.getConfig();
    if (!includesAnyDomainSubstring(window.location.host, config.injectIntoDomains)) {
        // This script is injected into _every_ page, so we have to filter here:
        // Only do stuff on the configured GitHub site!
        return;
    }

    // Get the first injector that canHandleCurrentPage()
    const injectorProvider = new InjectorProvider(configProvider);
    const injector = injectorProvider.findInjectorForCurrentPage();
    if (!injector) {
        // This script is injected into _every_ page, so we have to filter here:
        // Only do stuff on the configured and supported sites!
        return
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

const includesAnyDomainSubstring = (location: string, domainPatterns: string[]): boolean => {
    for (const pattern of domainPatterns) {
        if (location.includes(pattern)) {
            return true;
        }
    }
    return false;
};

const updateOnDOMChanges = (injector: Injector) => {
    observer = new MutationObserver(function (mutations) {
		if (!injector.checkIsInjected() && !isInstalling) {
			isInstalling = true;
			injector.update()
                .then(() => isInstalling = false);
		}
	});
	observer.observe(
		document,
		{
			childList: true,
			subtree: true,
			attributes: true,
			characterData: true
		}
	);
};

/**
 * This method is called on config changes. It resets the state to inital and re-runs init
 */
const reinit = () => {
    initChain.then(async () => {
        isInstalling = false;
        if (observer) {
            observer.disconnect();
            observer = undefined;
        }
    }).then(init);
};


initChain = init();
