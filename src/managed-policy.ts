import type { Storage } from "webextension-polyfill";

import { DEFAULT_ONA_ENDPOINT } from "./constants";

export const POLICY_ONA_INSTANCE_URL = "OnaInstanceUrl";

export type PolicyStorage = {
    managed?: Pick<Storage.StorageArea, "get">;
    onChanged: Storage.Static["onChanged"];
};

export function parsePolicyUrl(value: unknown): string | undefined {
    if (typeof value !== "string" || !/^https?:\/\//i.test(value) || /[\s\\]/.test(value)) {
        return undefined;
    }
    try {
        const url = new URL(value);
        if (!url.hostname || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
            return undefined;
        }
        return url.origin;
    } catch {
        return undefined;
    }
}

export async function readManagedUrl(storage: PolicyStorage): Promise<string | undefined> {
    try {
        const values = await storage.managed?.get(POLICY_ONA_INSTANCE_URL);
        return parsePolicyUrl(values?.[POLICY_ONA_INSTANCE_URL]);
    } catch {
        // Firefox rejects managed.get when no managed storage is provisioned.
        return undefined;
    }
}

export function resolveInstanceUrl(savedUrl: string | undefined, managedUrl: string | undefined) {
    return {
        address: managedUrl ?? savedUrl ?? DEFAULT_ONA_ENDPOINT,
        managed: managedUrl !== undefined,
    };
}

export function watchManagedUrl(storage: PolicyStorage, onChange: (url: string | undefined) => void): () => void {
    let active = true;
    let changed = false;
    const listener: Parameters<PolicyStorage["onChanged"]["addListener"]>[0] = (changes, area) => {
        if (area === "managed" && POLICY_ONA_INSTANCE_URL in changes) {
            changed = true;
            onChange(parsePolicyUrl(changes[POLICY_ONA_INSTANCE_URL].newValue));
        }
    };
    storage.onChanged.addListener(listener);
    void readManagedUrl(storage).then((url) => {
        // A policy event received during the initial read is newer than that read.
        if (active && !changed) onChange(url);
    });
    return () => {
        active = false;
        storage.onChanged.removeListener(listener);
    };
}
