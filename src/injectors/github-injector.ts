import * as select from 'select-dom';
import * as ghInjection from 'github-injection';
import { ConfigProvider } from '../config';
import { ButtonInjector, InjectorBase, checkIsBtnUpToDate, rewritePeriodKeybindGitHub } from './injector';
import { renderGitpodUrl, ideOptions, createElementFromHTML, UrlInfo, makeOpenInPopup, renderGitpodCustomEditor } from '../utils';
import { IDEOptions } from "@gitpod/gitpod-protocol/lib/ide-protocol";

namespace Gitpodify {
    export const NAV_BTN_ID = "gitpod-btn-nav";
    export const NAV_BTN_CLASS = "gitpod-nav-btn";
    export const NAV_BTN_CLASS_SELECTOR = "." + NAV_BTN_CLASS;

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
        const urlInfo = renderGitpodUrl(this.config.gitpodURL);
        return checkIsBtnUpToDate(button, urlInfo.gitpodUrl);
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
        protected readonly containerClasses: string = "",
        protected readonly float: boolean = true,
        protected readonly asFirstChild: boolean = false
    ) { }

    abstract isApplicableToCurrentPage(): boolean;

    protected adjustButton(a: HTMLAnchorElement) {
        // do nothing
    }

    inject(urlInfo: UrlInfo, openAsPopup: boolean, useLatest: boolean) {
        const actionbar = select(this.parentSelector);
        if (!actionbar) {
            return;
        }

        const oldBtn = document.getElementById(Gitpodify.NAV_BTN_ID);
        if (oldBtn) {
            if (!checkIsBtnUpToDate(oldBtn, urlInfo.gitpodUrl)) {
                // update button
                (oldBtn as HTMLAnchorElement).href = urlInfo.gitpodUrl;
            }
            // button is there and up-to-date
            return;
        }

        const btn = this.genButton(urlInfo, openAsPopup, useLatest);

        const btnGroup = actionbar.getElementsByClassName("BtnGroup");
        const detailsBtn = Array.from(actionbar.children)
            .filter(child => child.tagName.toLowerCase() === "details" && child.id.endsWith("more-options-details"));
        if (btnGroup && btnGroup.length > 0 && btnGroup[0].classList.contains('float-right')) {
            actionbar.insertBefore(btn, btnGroup[0]);
        } else if (detailsBtn && detailsBtn.length > 0) {
            if (detailsBtn[0].previousElementSibling) {
                detailsBtn[0].previousElementSibling.classList.remove("mr-2");
            }
            btn.classList.add("mr-2");
            actionbar.insertBefore(btn, detailsBtn[0]);
        } else if (this.asFirstChild && actionbar) {
            actionbar.insertBefore(btn, actionbar.firstChild);
        } else {
            actionbar.appendChild(btn);
        }

        const primaryButtons = actionbar.getElementsByClassName("btn-primary");
        if (primaryButtons && primaryButtons.length > 2) {
            Array.from(primaryButtons)
                .slice(0, primaryButtons.length - 2)
                .forEach(primaryButton => primaryButton.classList.replace("btn-primary", "btn-secondary"));
        }
    }

    genOptionsString(ideOptions: IDEOptions, urlInfo: UrlInfo, useLatest: boolean) {
        if (!ideOptions.clients) {
            return []
        }
        return Object.entries(ideOptions.options ?? {}).map(([ide, ideOption]) => {
            const url = renderGitpodCustomEditor(urlInfo.host, urlInfo.originUrl, ide, useLatest);
            const title = ideOption.title + (ideOption.type === "desktop" ? "" : (" - " + ideOption.type.toUpperCase()));
            return `<a class="select-menu-item" tabindex="0" role="menuitemradio" aria-checked="true" href="${url}" target="_blank">
                        <img style="margin-top: 3px" aria-hidden="true" height="14" width="14" data-view-component="true" class="octicon octicon-check select-menu-item-icon" src="${ideOption.logo}" alt="logo">
                        <input type="radio" name="draft" id="draft_off" value="off" >
                        <div class="select-menu-item-text">
                            <span class="select-menu-item-heading">${title}</span>
                            <span class="description text-normal">
                                Open in ${title}
                            </span>
                            <span data-menu-button-text="" hidden="">
                                ${title}
                            </span>
                        </div>
                    </a>`
        })
    }

    genButton(urlInfo: UrlInfo, openAsPopup: boolean, useLatest: boolean) {
        let classes = this.btnClasses + ` ${Gitpodify.NAV_BTN_CLASS}`;
        if (this.float) {
            classes = classes + ` float-right`;
        }
        
        const element = createElementFromHTML(`
        <div id="${Gitpodify.CSS_REF_BTN_CONTAINER}" class="BtnGroup width-full width-md-auto d-flex p-0 ${this.containerClasses}">
            <a id="${Gitpodify.NAV_BTN_ID}"
                href="${urlInfo.gitpodUrl}"
                class="btn btn-primary BtnGroup-item flex-auto ${this.btnClasses}"> Gitpod
            </a>
            <details class="details-reset details-overlay select-menu BtnGroup-parent position-relative">
                <summary data-disable-invalid="" data-disable-with="" aria-label="Select editor to open a workspace"
                    data-view-component="true" class="select-menu-button btn-primary btn BtnGroup-item float-none ${this.btnClasses}"
                    style="margin-left: 0;"
                    aria-haspopup="menu" role="button">
                </summary>
                <details-menu class="select-menu-modal position-absolute right-0 js-sync-select-menu-text"
                    style="z-index: 99" role="menu">
                    ${this.genOptionsString(ideOptions, urlInfo, useLatest).join("\n")}
                </details-menu>
            </details>
        </div>`)
        if (openAsPopup) {
            element.querySelectorAll('a').forEach(e => {
                makeOpenInPopup(e);
            });
        }
        return element
    }
}

class PullInjector extends ButtonInjectorBase {
    constructor() {
        super(".gh-header-actions", "btn-sm", "ml-0");
    }

    isApplicableToCurrentPage(): boolean {
        return window.location.pathname.includes("/pull/");
    }
}

class IssueInjector extends ButtonInjectorBase {
    constructor() {
        super(".gh-header-actions", "btn-sm", "ml-1");
    }

    isApplicableToCurrentPage(): boolean {
        return window.location.pathname.includes("/issues/");
    }
}

class FileInjector extends ButtonInjectorBase {
    constructor() {
        super(".repository-content > div > div > div", "gitpod-file-btn", "ml-2");
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
        super(".file-navigation", "empty-icon position-relative", "ml-2");
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
        super(".repository-content", Gitpodify.CSS_REF_NO_CONTAINER, "", false, true);
    }

    protected adjustButton(a: HTMLAnchorElement): void {
        a.className = "btn btn-primary";
    }

    isApplicableToCurrentPage(): boolean {
        return !!select.exists("#empty-setup-clone-url");
    }
}
