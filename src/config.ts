import { browser, Storage } from "webextension-polyfill-ts";
import { EventEmitter } from "events";

export interface Config {
    gitpodURL: string;
}

export const DEFAULT_CONFIG: Config = {
    gitpodURL: "https://gitpod.io"
};

export interface ConfigListener {
    onNewConfig(): void;
}

export class ConfigProvider {
    static readonly LOCAL_STORAGE_KEY = "config";
    static readonly EVENT_CONFIG_UPDATED = "config-updated";

    protected config: Config = DEFAULT_CONFIG;
    readonly emitter = new EventEmitter();

    protected constructor() {}

    static async create(): Promise<ConfigProvider> {
        const provider = new ConfigProvider();
        await provider.init();
        return provider;
    }

    protected async init() {
        browser.storage.onChanged.addListener(this.configChangeListener);

        // Make sure we're up-to-date
        const currentConfig = await this.readConfig();
        this.config = {
            ...DEFAULT_CONFIG,
            ...currentConfig
        };
    }

    async setConfig(newPartialConfig: Partial<Config>): Promise<void> {
        const currentConfig = await this.readConfig();
        const newConfig = {
            ...DEFAULT_CONFIG,
            ...currentConfig,
            ...newPartialConfig
        };

        // Propagate new config to all instances (including ourselves)
        const storageUpdate = {} as any;
        storageUpdate[ConfigProvider.LOCAL_STORAGE_KEY] = newConfig;
        await browser.storage.local.set(storageUpdate);
    }

    getConfig(): Config {
        return this.config;
    }

    on(l: () => void) {
        this.emitter.on(ConfigProvider.EVENT_CONFIG_UPDATED, l);
    }

    dispose() {
        browser.storage.onChanged.removeListener(this.configChangeListener);
        this.emitter.removeAllListeners();
    }

    protected async readConfig(): Promise<Partial<Config>> {
        const { config } = await browser.storage.local.get(ConfigProvider.LOCAL_STORAGE_KEY);
        return config || {};
    }

    protected configChangeListener = (changes: { [s: string]: Storage.StorageChange }) => {
        if (!changes[ConfigProvider.LOCAL_STORAGE_KEY]) {
            return;
        }

        this.config = changes[ConfigProvider.LOCAL_STORAGE_KEY] as Config;

        // Notify listeners about the fresh config
        this.emitter.emit(ConfigProvider.EVENT_CONFIG_UPDATED);
    }
}
