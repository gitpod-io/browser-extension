import type { Storage } from "@plasmohq/storage";

import { readManagedUrl, type PolicyStorage } from "./managed-policy";
import { STORAGE_AUTOMATICALLY_DETECT_GITPOD, STORAGE_KEY_ADDRESS } from "./storage";
import { parseEndpoint } from "./utils/parse-endpoint";

export async function automaticallyUpdateEndpoint(
    storage: Pick<Storage, "get" | "set">,
    policyStorage: PolicyStorage,
    origin: string,
) {
    if ((await storage.get<boolean>(STORAGE_AUTOMATICALLY_DETECT_GITPOD)) !== true) return;

    const savedUrl = await storage.get<string>(STORAGE_KEY_ADDRESS);
    if ((await readManagedUrl(policyStorage)) !== undefined) return;

    if (!savedUrl || new URL(savedUrl).host !== new URL(origin).host) {
        await storage.set(STORAGE_KEY_ADDRESS, parseEndpoint(origin));
    }
}
