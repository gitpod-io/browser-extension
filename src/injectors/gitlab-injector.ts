import * as domloaded from 'dom-loaded';
import * as select from 'select-dom';
import { ConfigProvider } from '../config';
import { ButtonInjector, InjectorBase, checkIsBtnUpToDate } from './injector';

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
        const currentUrl = this.renderGitpodUrl();
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

// Layout:
// <div class="project-clone-holder d-none d-md-inline-flex">
//     <div class="git-clone-holder js-git-clone-holder input-group">
//         <a class="input-group-text btn btn-primary btn-xs clone-dropdown-btn qa-clone-dropdown" data-toggle="dropdown" href="#" id="clone-dropdown" aria-expanded="false">
//             <span class="append-right-4 js-clone-dropdown-label">
//                 Clone
//             </span>
//             <svg class="icon"><use xlink:href="/assets/icons-5d6bba47cc3d399a160c22f8283b68e070717b97c9a35c0e3006d998b730b163.svg#arrow-down"></use></svg>
//         </a>
//         // ...
//     </div>
// </div>
class RepositoryInjector implements ButtonInjector {
    static readonly PARENT_SELECTOR = ".project-repo-buttons";

    isApplicableToCurrentPage(): boolean {
        const result = !!select.exists(RepositoryInjector.PARENT_SELECTOR);
        return result;
    }

    inject(currentUrl: string) {
        const projectRepoButtons = select(RepositoryInjector.PARENT_SELECTOR);
        if (!projectRepoButtons) {
            return;
        }

        const oldBtn = document.getElementById(Gitpodify.BTN_ID);
        if (oldBtn && !checkIsBtnUpToDate(oldBtn, currentUrl)) {
            // Only add once
            (oldBtn as HTMLAnchorElement).href = currentUrl;
            return;
        }

        const btn = this.renderButton(currentUrl);
        projectRepoButtons.appendChild(btn);
    }

    protected renderButton(url: string): HTMLElement {
        const container = document.createElement('div');
        container.className = "project-clone-holder d-none d-md-inline-flex";
        container.style.marginLeft = '8px'; // The only thing not copied from the clone button

        const container2ndLevel = document.createElement('div');
        container2ndLevel.className = "git-clone-holder js-git-clone-holder input-group";

        const a = document.createElement('a');
        a.id = Gitpodify.BTN_ID;
        a.title = "Gitpod";
        a.text = "Gitpod"
        a.href = url;
        a.target = "_blank";
        a.className = "input-group-text btn btn-primary btn-xs";

        container2ndLevel.appendChild(a);
        container.appendChild(container2ndLevel);
        return container;
    }
}