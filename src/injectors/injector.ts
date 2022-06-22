import { ConfigProvider } from "../config";
import { renderGitpodUrl } from "../utils";
import { isVisible } from "../utils";

export interface Injector {

    /**
     * Whether this injector can inject into the current page
     * @param host 
     */
    canHandleCurrentPage(): boolean;

    /**
     * Contract: Multiple calls are allowed, the implementation has to properly handle potential config updates between calls.
     */
    inject(): Promise<void>;

    /**
     * TODO Needed? Currently used to avoid the button flickering on updates. Maybe not needed with a better implementation of "inject"
     * Returns true if the injector is already installed and up-to-date with the current config
     */
    checkIsInjected(): boolean;

    /**
     * Update an existing injection with the current config
     */
    update(): Promise<void>;
}

export interface ButtonInjector {
    /**
     * Whether the injector is meant to be used on the current page
     */
    isApplicableToCurrentPage(): boolean;

    /**
     * Injects the actual button
     * @param currentUrl The currently configured Gitpod URL
     */
    inject(currentUrl: string, openAsPopup: boolean): void;
}

export abstract class InjectorBase implements Injector {
    constructor(
        protected readonly configProvider: ConfigProvider,
        protected readonly buttonInjectors: ButtonInjector[]
    ) {}

    abstract canHandleCurrentPage(): boolean;
    abstract checkIsInjected(): boolean;
    abstract inject(): Promise<void>;
    abstract update(): Promise<void>;

    injectButtons(singleInjector: boolean = false) {
        const currentUrl = renderGitpodUrl(this.config.gitpodURL);
        for (const injector of this.buttonInjectors) {
            if (injector.isApplicableToCurrentPage()) {
                injector.inject(currentUrl, this.config.openAsPopup);
                if (singleInjector) {
                    break;
                }
            }
        }
    };

    editFileButton(singleInjector: boolean = false){
        const currentUrl = renderGitpodUrl(this.config.gitpodURL);
        for (const injector of this.buttonInjectors) {
            if (injector.isApplicableToCurrentPage()) {
                injector.inject(currentUrl, this.config.openAsPopup);
                if (singleInjector) {
                    break;
                }
            }
        }
    };

    protected get config() {
        return this.configProvider.getConfig();
    }
}

function openInGitpod(e: MouseEvent | KeyboardEvent, inNewTab: boolean) {
    const currentUrl = window.location.href;
    window.open(`https://gitpod.io/#${currentUrl}`, inNewTab ? '_blank' : '_self');
    e.preventDefault();
    e.stopPropagation();
}

export async function rewritePeriodKeybindGitHub() {
    const configProvider = await ConfigProvider.create();
    const config = configProvider.getConfig();

    if (config.rewritePeriodKeybind) {
        document.querySelectorAll('.js-github-dev-shortcut, .js-github-dev-new-tab-shortcut').forEach((elem) => {
            const new_element = elem.cloneNode(true) as HTMLElement;
            elem.parentNode?.replaceChild(new_element, elem);
            new_element.addEventListener('click', (e) => {
                if (new_element && isVisible(new_element) && !confirm('Are you sure you want to open gitpod.io?')) {
                    return;
                }
                openInGitpod(e, elem.classList.contains('js-github-dev-new-tab-shortcut') || config.openAsPopup);
            });
        });
    }
}

export async function rewritePeriodKeybindGitLab() {
    const configProvider = await ConfigProvider.create();
    const config = configProvider.getConfig();

    if (config.rewritePeriodKeybind) {
        const unbindMousetrapScript = document.createElement('script');
        unbindMousetrapScript.innerHTML='window.Mousetrap.unbind(".");';
        document.head.appendChild(unbindMousetrapScript);

        document.onkeydown = (e: KeyboardEvent) => {
            if (e.code === 'Period') {
                openInGitpod(e, e.shiftKey || config.openAsPopup);
            }
        };
    }
}

export const checkIsBtnUpToDate = (button: HTMLElement | null, currentUrl: string): boolean => {
    return !!button && button instanceof HTMLAnchorElement && button.href === currentUrl;
};