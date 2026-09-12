import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { useStorage } from "@plasmohq/storage/hook";

import { resolveInstanceUrl, watchManagedUrl } from "../managed-policy";
import { STORAGE_KEY_ADDRESS } from "../storage";

export function useInstanceUrl() {
    const [savedUrl] = useStorage<string>(STORAGE_KEY_ADDRESS);
    const [policy, setPolicy] = useState<{ url?: string; ready: boolean }>({ ready: false });

    useEffect(() => watchManagedUrl(browser.storage, (url) => setPolicy({ url, ready: true })), []);

    return {
        ...resolveInstanceUrl(savedUrl, policy.url),
        ready: policy.ready,
    };
}
