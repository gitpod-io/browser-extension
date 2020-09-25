import * as domloaded from 'dom-loaded';
import * as select from 'select-dom';
import { ConfigProvider } from '../config';
import { ButtonInjector, InjectorBase, checkIsBtnUpToDate } from './injector';
import { renderGitpodUrl, makeOpenInPopup } from '../utils';

namespace Gitpodify {
	export const BTN_ID = "gitpod-btn-nav";
	export const BTN_CLASS = "gitpod-nav-btn";
}

export class GitlabInjector extends InjectorBase {

    constructor(protected readonly configProvider: ConfigProvider) {
        super(configProvider, [
            new RepositoryInjector()
        ]);
    }

    canHandleCurrentPage(): boolean {
        const metaTags = document.getElementsByTagName("meta");
        for (let i = 0; i < metaTags.length; i++) {
            const metaTag = metaTags[i];
            if (metaTag.content.toLowerCase().includes("gitlab")) {
                return true;
            }
        }
        return false;
    }

    checkIsInjected(): boolean {
        const button = document.getElementById(`${Gitpodify.BTN_ID}`);
        const currentUrl = renderGitpodUrl(this.config.gitpodURL);
        return checkIsBtnUpToDate(button, currentUrl);
    }

    async inject(): Promise<void> {
        await domloaded;    // TODO(geropl) This is dead slow, improve.

        this.injectButtons(false);
    }

    async update(): Promise<void> {
        this.injectButtons(false);
    }
}

class RepositoryInjector implements ButtonInjector {
    static readonly PARENT_SELECTOR = ".tree-controls";

    isApplicableToCurrentPage(): boolean {
        const result = !!select.exists(RepositoryInjector.PARENT_SELECTOR)
            && !!select.exists(".project-clone-holder")
            && !select.exists('[data-qa-selector="gitpod_button"]');
        return result;
    }

    inject(currentUrl: string, openAsPopup: boolean) {
        const parent = select(RepositoryInjector.PARENT_SELECTOR);
        if (!parent || !parent.firstElementChild) {
            return;
        }

        const oldBtn = document.getElementById(Gitpodify.BTN_ID);
        if (oldBtn && !checkIsBtnUpToDate(oldBtn, currentUrl)) {
            // Only add once
            (oldBtn as HTMLAnchorElement).href = currentUrl;
            return;
        }

        const btn = this.renderButton(currentUrl, openAsPopup);
        parent.firstElementChild.appendChild(btn);

        const primaryButtons = parent.firstElementChild.getElementsByClassName("btn-primary");
        if (primaryButtons && primaryButtons.length > 1) {
            Array.from(primaryButtons)
                .slice(0, primaryButtons.length - 1)
                .forEach(primaryButton => {
                    primaryButton.classList.remove("btn-primary");
                    Array.from(primaryButton.getElementsByTagName("svg")).forEach(svg => svg.style.fill = "currentColor")
                });
        }
    }

    protected renderButton(url: string, openAsPopup: boolean): HTMLElement {
        const container = document.createElement('div');
        container.className = "project-clone-holder d-none d-md-inline-block";

        const container2ndLevel = document.createElement('div');
        container2ndLevel.className = "git-clone-holder js-git-clone-holder";

        const a = document.createElement('a');
        a.id = Gitpodify.BTN_ID;
        a.title = "Gitpod";
        a.text = "Gitpod"
        a.href = url;
        a.target = "_blank";
        a.className = "btn btn-primary";
        
        if (openAsPopup) {
            makeOpenInPopup(a);
        }

        container2ndLevel.appendChild(a);
        container.appendChild(container2ndLevel);
        return container;
    }
}