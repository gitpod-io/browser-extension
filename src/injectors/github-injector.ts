import * as select from 'select-dom';
import * as ghInjection from 'github-injection';
import { ConfigProvider } from '../config';
import { ButtonInjector, InjectorBase, checkIsBtnUpToDate, rewritePeriodKeybindGitHub } from './injector';
import { renderGitpodUrl, makeOpenInPopup } from '../utils';

namespace Gitpodify {
	export const NAV_BTN_ID = "gitpod-btn-nav";
	export const NAV_BTN_CLASS = "gitpod-nav-btn";
    export const NAV_BTN_CLASS_SELECTOR = "." + NAV_BTN_CLASS;

    export const EDIT_BTN_ID = "gitpod-btn-file";

    export const CSS_REF_BTN_CONTAINER = "gitpod-btn-container";
    export const CSS_REF_NO_CONTAINER = "no-container";
}

/**
 * This implementation currently assumes that there is only ever one button per page
 */
export class GitHubInjector extends InjectorBase {

    constructor(configProvider: ConfigProvider) {
        super(configProvider, [
            new PullInjector(),
            new IssueInjector(),
            new FileInjector(),
            new EditFileButtonInjector(),
            new NavigationInjector(),
            new EmptyRepositoryInjector(),
        ]);
    }

    canHandleCurrentPage(): boolean {
        // TODO Does this work for GitHub Enterprise, too?
        const metaTags = document.getElementsByTagName("meta");
        for (let i = 0; i < metaTags.length; i++) {
            const metaTag = metaTags[i];
            if (metaTag.name === "hostname" && metaTag.content.includes("github")) {
                return true;
            }
        }
        return false;
    }

    checkIsInjected(): boolean {
        const button = document.getElementById(`${Gitpodify.NAV_BTN_ID}`);
        const currentUrl = renderGitpodUrl(this.config.gitpodURL);
        return checkIsBtnUpToDate(button, currentUrl);
    }

    async inject(): Promise<void> {
        // ghInjection triggers an event whenever only parts of the GitHub page have been reloaded
	    ghInjection(() => {
            if (!this.checkIsInjected()) {
                this.injectButtons();
            }
            
            (async () => {
               await rewritePeriodKeybindGitHub();
            })();
        });
    }

    async update(): Promise<void> {
        this.injectButtons();
    }
}

abstract class ButtonInjectorBase implements ButtonInjector {

    constructor(
        protected readonly parentSelector: string,
        protected readonly btnClasses: string,
        protected readonly float: boolean = true,
        protected readonly asFirstChild: boolean = false
    ) {}

    abstract isApplicableToCurrentPage(): boolean;

    inject(currentUrl: string, openAsPopup: boolean) {
        const actionbar = select(this.parentSelector);
        if (!actionbar) {
            return;
        }

        const oldBtn = document.getElementById(Gitpodify.NAV_BTN_ID);
        if (oldBtn) {
            if (!checkIsBtnUpToDate(oldBtn, currentUrl)) {
                // update button
                (oldBtn as HTMLAnchorElement).href = currentUrl;
            }
            // button is there and up-to-date
            return;
        }

        const btn = this.renderButton(currentUrl, openAsPopup);

        const btnGroup = actionbar.getElementsByClassName("BtnGroup");
        const detailsBtn = Array.from(actionbar.children)
            .filter(child => child.tagName.toLowerCase() === "details" && child.id.endsWith("more-options-details"));
        if (btnGroup && btnGroup.length > 0 && btnGroup[0].classList.contains('float-right')) {
            actionbar.insertBefore(btn, btnGroup[0]);
        } else if (detailsBtn && detailsBtn.length > 0) {
            if (detailsBtn[0].previousElementSibling) {
                detailsBtn[0].previousElementSibling.classList.remove("mr-2","ml-2");
            }
            btn.classList.add("mr-2","ml-2");
            actionbar.insertBefore(btn, detailsBtn[0]);
        } else if (this.asFirstChild && actionbar) {
            actionbar.insertBefore(btn, actionbar.firstChild);
        } else {
            actionbar.appendChild(btn);
        }

        const primaryButtons = actionbar.getElementsByClassName("btn-primary");
        if (primaryButtons && primaryButtons.length > 1) {
            Array.from(primaryButtons)
            .slice(0, primaryButtons.length - 1)
            .forEach(primaryButton => primaryButton.classList.replace("btn-primary", "btn-secondary"));
        }

        // Edit File Menu Options - Open in Gitpod
        const editFileButton = document.querySelector('.Box-header .select-menu .SelectMenu-list') as ParentNode;
        if (editFileButton) {
            editFileButton.prepend(this.renderEditButton(currentUrl, openAsPopup));
        }
    }

    protected renderButton(url: string, openAsPopup: boolean): HTMLElement {
        let classes = this.btnClasses + ` ${Gitpodify.NAV_BTN_CLASS}`;
        if (this.float) {
            classes = classes + ` float-right`;
        }

        const container = document.createElement('div');
        container.id = Gitpodify.CSS_REF_BTN_CONTAINER;
        container.className = classes;

        const a = document.createElement('a');
        a.id = Gitpodify.NAV_BTN_ID;
        a.title = "Gitpod";
        a.text = "Gitpod"
        a.href = url;
        a.target = "_blank";
        if (openAsPopup) {
            makeOpenInPopup(a);
        }
        a.className = "btn btn-sm btn-primary";

        this.adjustButton(a);

        container.appendChild(a);
        return container;
    }
    protected adjustButton(a: HTMLAnchorElement) {
        // do nothing
    }

    protected renderEditButton(url: string, openAsPopup: boolean): HTMLElement {
        const a = document.createElement('a');
        a.id = Gitpodify.EDIT_BTN_ID;
        a.title = "Edit this file in Gitpod";
        a.text = "Open in Gitpod";
        a.href = url;
        a.target = "_blank";
        if (openAsPopup) {
            makeOpenInPopup(a);
        }
        a.className = "SelectMenu-item js-blob-dropdown-click width-full d-flex flex-justify-between color-fg-default f5 text-normal";
        return a;
    }
}

class PullInjector extends ButtonInjectorBase {
    constructor() {
        super(".gh-header-actions", "");
    }

    isApplicableToCurrentPage(): boolean {
		return window.location.pathname.includes("/pull/");
    }
}

class IssueInjector extends ButtonInjectorBase {
    constructor() {
        super(".gh-header-actions", "");
    }

    isApplicableToCurrentPage(): boolean {
		return window.location.pathname.includes("/issues/");
    }
}

class EditFileButtonInjector extends ButtonInjectorBase {
    constructor() {
        super("", "gitpod-file-edit-btn");
    }

    isApplicableToCurrentPage(): boolean {
        return window.location.pathname.includes("/blob/");
    }
}

class FileInjector extends ButtonInjectorBase {
    constructor() {
        super(".repository-content > div > div > div", "gitpod-file-btn");
    }

    protected adjustButton(a: HTMLAnchorElement): void {
        a.className = "btn btn-primary";
    }

    isApplicableToCurrentPage(): boolean {
        return window.location.pathname.includes("/blob/");
    }
}

class NavigationInjector extends ButtonInjectorBase {
    constructor() {
        super(".file-navigation", "empty-icon position-relative");
    }

    protected adjustButton(a: HTMLAnchorElement): void {
        a.className = "btn btn-primary";
    }

    isApplicableToCurrentPage(): boolean {
        return !!select.exists(".file-navigation");
    }
}

class EmptyRepositoryInjector extends ButtonInjectorBase {
    constructor() {
        super(".repository-content > div > git-clone-help > div > div ", "gitpod-file-btn", false, true);
    }

    protected adjustButton(a: HTMLAnchorElement): void {
        a.className = "btn btn-sm btn-primary";
    }

    isApplicableToCurrentPage(): boolean {
        return !!select.exists("#empty-setup-clone-url");
    }
}
