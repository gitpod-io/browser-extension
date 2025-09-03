import browser from "webextension-polyfill";
import { ALL_ORIGINS_WILDCARD } from "~constants";

export const canAccessAllSites = async () => {
    return await browser.permissions.contains({ origins: [ALL_ORIGINS_WILDCARD] });
};

export const canAccessOrigin = async (origin: string) => {
    return await browser.permissions.contains({ origins: [origin] });
};
