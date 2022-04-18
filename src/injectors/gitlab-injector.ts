import * as domloaded from 'dom-loaded';
import * as select from 'select-dom';
import { ConfigProvider } from '../config';
import { ButtonInjector, InjectorBase, checkIsBtnUpToDate, rewritePeriodKeybindGitLab } from './injector';
import { renderGitpodUrl, makeOpenInPopup, UrlInfo, renderGitpodCustomEditor, createElementFromHTML, ideOptions } from '../utils';
import { IDEOptions } from '@gitpod/gitpod-protocol/lib/ide-protocol';

namespace Gitpodify {
    export const BTN_ID = "gitpod-btn-nav";
    export const BTN_CLASS = "gitpod-nav-btn";
}


const DropdownID = "gitpod-dropdown"
const DropdownTriggerID = "gitpod-dropdown-trigger"

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
        const urlInfo = renderGitpodUrl(this.config.gitpodURL);
        return checkIsBtnUpToDate(button, urlInfo.gitpodUrl);
    }

    async inject(): Promise<void> {
        await domloaded;    // TODO(geropl) This is dead slow, improve.
        this.injectButtons(false);
        if (this.canHandleCurrentPage() && this.checkIsInjected()) {
            await rewritePeriodKeybindGitLab();
        }
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

    inject(urlInfo: UrlInfo, openAsPopup: boolean, useLatest: boolean) {
        const parent = select(RepositoryInjector.PARENT_SELECTOR);
        if (!parent || !parent.firstElementChild) {
            return;
        }
        const currentUrl = urlInfo.gitpodUrl;

        const oldBtn = document.getElementById(Gitpodify.BTN_ID);
        if (oldBtn && !checkIsBtnUpToDate(oldBtn, currentUrl)) {
            // Only add once
            (oldBtn as HTMLAnchorElement).href = currentUrl;
            return;
        }

        const btn = this.renderButton(urlInfo, openAsPopup, useLatest);
        parent.firstElementChild.appendChild(btn);
        this.bindDropdown()

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

    genOptionsString(ideOptions: IDEOptions, urlInfo: UrlInfo, useLatest: boolean) {
        if (!ideOptions.clients) {
            return []
        }
        return Object.entries(ideOptions.options ?? {}).map(([ide, ideOption]) => {
            const url = renderGitpodCustomEditor(urlInfo.host, urlInfo.originUrl, ide, useLatest);
            const title = ideOption.title + (ideOption.type === "desktop" ? "" : (" - " + ideOption.type.toUpperCase()));
            const logo = ideOption.logo
            return `<li role="presentation" class="gl-new-dropdown-item"><button data-qa-selector="webide_menu_item"
                        data-testid="action_webide" role="menuitem" type="button" class="dropdown-item">
                        <img class="gl-icon s16 gl-new-dropdown-item-check-icon gl-mt-3 gl-align-self-start" height="14" width="14" class="octicon octicon-check select-menu-item-icon" src="${logo}" alt="logo">
                        <a class="dropdown-item dropdown-item open-with-link" style="padding: 0;" href="${url}">
                            <div class="gl-new-dropdown-item-text-wrapper">
                                <p class="gl-new-dropdown-item-text-primary"><span
                                        class="gl-font-weight-bold">${title}</span></p>
                            </div>
                        </a>
                    </button></li>`
        })
    }

    bindDropdown() {
        const element = document.querySelector('#' + DropdownTriggerID) as HTMLButtonElement
        if (element == null) {
            return
        }
        element.onclick = () => { this.triggerDropdown() }
    }

    triggerDropdown() {
        const element = document.querySelector('#' + DropdownID)
        const show = !element?.classList.contains("show")
        if (show) {
            element?.classList.add("show")
        } else {
            element?.classList.remove("show")
        }
    }

    protected renderButton(urlInfo: UrlInfo, openAsPopup: boolean, useLatest: boolean) {
        const element = createElementFromHTML(`
        <div class="dropdown b-dropdown gl-new-dropdown btn-group" data-qa-selector="action_dropdown" id="GP_DROPDOWN">
            <a id="GP_DROPDOWN__BV_button_" type="button" href="${urlInfo.gitpodUrl}"
                class="btn btn-default btn-md gl-button split-content-button btn-default-secondary">
                <span
                    data-qa-selector="gitpod_button" class="gl-new-dropdown-button-text">
                    Gitpod
                </span>
            </a>
            <button id="${DropdownTriggerID}" aria-haspopup="true" aria-expanded="true" type="button"
                class="btn dropdown-toggle btn-default btn-md gl-button gl-dropdown-toggle btn-default-secondary dropdown-toggle-split"
                id="GP_DROPDOWN__BV_toggle_">
                <span class="sr-only">Toggle dropdown</span>
            </button>
            <ul id="${DropdownID}" role="menu" tabindex="-1" class="dropdown-menu" aria-labelledby="GP_DROPDOWN__BV_button_"
                style="position: absolute; transform: translate3d(-144px, 32px, 0px); top: 0px; left: 0px; will-change: transform;"
                x-placement="bottom-start">
                <div class="gl-new-dropdown-inner">
                    <label class="px-2 label-bold">Open with</label>
                    <div class="gl-new-dropdown-contents">
                        ${this.genOptionsString(ideOptions, urlInfo, useLatest).join("\n")}
                    </div>
                </div>
            </ul>
        </div>`)

        if (openAsPopup) {
            element.querySelectorAll('a').forEach(e => {
                makeOpenInPopup(e);
            });
        }
        return element
    }

    // protected renderButton(url: string, openAsPopup: boolean): HTMLElement {
    //     const container = document.createElement('div');
    //     container.className = "project-clone-holder d-none d-md-inline-block";

    //     const container2ndLevel = document.createElement('div');
    //     container2ndLevel.className = "git-clone-holder js-git-clone-holder";

    //     const a = document.createElement('a');
    //     a.id = Gitpodify.BTN_ID;
    //     a.title = "Gitpod";
    //     a.text = "Gitpod"
    //     a.href = url;
    //     a.target = "_blank";
    //     a.className = "gl-button btn btn-info";

    //     if (openAsPopup) {
    //         makeOpenInPopup(a);
    //     }

    //     container2ndLevel.appendChild(a);
    //     container.appendChild(container2ndLevel);
    //     return container;
    // }
}