import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_ONA_ENDPOINT } from "../../src/constants";
import { automaticallyUpdateEndpoint } from "../../src/instance-hopping";
import {
    parsePolicyUrl,
    POLICY_ONA_INSTANCE_URL,
    readManagedUrl,
    resolveInstanceUrl,
    watchManagedUrl,
    type PolicyStorage,
} from "../../src/managed-policy";
import { STORAGE_AUTOMATICALLY_DETECT_GITPOD, STORAGE_KEY_ADDRESS } from "../../src/storage";

function policyFixture(initial?: unknown) {
    let value = initial;
    const listeners = new Set<Parameters<PolicyStorage["onChanged"]["addListener"]>[0]>();
    const storage: PolicyStorage = {
        managed: { get: async () => ({ [POLICY_ONA_INSTANCE_URL]: value }) },
        onChanged: {
            addListener: (listener) => {
                listeners.add(listener);
            },
            removeListener: (listener) => {
                listeners.delete(listener);
            },
            hasListener: (listener) => listeners.has(listener),
        },
    };
    return {
        storage,
        listeners,
        change(next: unknown, area = "managed", key = POLICY_ONA_INSTANCE_URL) {
            const oldValue = value;
            if (area === "managed" && key === POLICY_ONA_INSTANCE_URL) value = next;
            for (const listener of listeners) listener({ [key]: { oldValue, newValue: next } }, area);
        },
    };
}

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

describe("OnaInstanceUrl", () => {
    it("normalizes HTTP(S) origins", () => {
        assert.equal(parsePolicyUrl("https://ONA.example.com:443/"), "https://ona.example.com");
        assert.equal(parsePolicyUrl("http://localhost:3000"), "http://localhost:3000");
    });

    for (const value of [
        undefined,
        null,
        false,
        42,
        {},
        [],
        "",
        "ona.example.com",
        "https://",
        "not a url",
        "javascript:alert(1)",
        "ftp://ona.example.com",
        "gitpod://",
        "https://user:pass@ona.example.com",
        "https://ona.example.com/path",
        "https://ona.example.com/?x=1",
        "https://ona.example.com/#repo",
        " https://ona.example.com",
        "https://ona.example.com\n",
        "https:\\ona.example.com",
        "https://a:99999",
    ]) {
        it(`ignores invalid policy ${JSON.stringify(value)}`, async () => {
            assert.equal(parsePolicyUrl(value), undefined);
            const managed = await readManagedUrl(policyFixture(value).storage);
            assert.deepEqual(resolveInstanceUrl("https://saved.example.com", managed), {
                address: "https://saved.example.com",
                managed: false,
            });
        });
    }

    it("prefers policy, then the saved setting, then the built-in default", async () => {
        const managed = await readManagedUrl(policyFixture("https://managed.example.com/").storage);
        assert.deepEqual(resolveInstanceUrl("https://saved.example.com", managed), {
            address: "https://managed.example.com",
            managed: true,
        });
        assert.equal(resolveInstanceUrl(undefined, managed).address, managed);
        assert.equal(resolveInstanceUrl("gitpod://", undefined).address, "gitpod://");
        assert.equal(resolveInstanceUrl(undefined, undefined).address, DEFAULT_ONA_ENDPOINT);
    });

    it("falls back when managed storage is absent or rejects (Firefox without policy)", async () => {
        const { storage } = policyFixture();
        delete storage.managed;
        assert.equal(await readManagedUrl(storage), undefined);
        storage.managed = {
            get: async () => {
                throw new Error("Managed storage manifest not found");
            },
        };
        assert.equal(await readManagedUrl(storage), undefined);
    });

    it("publishes live updates, invalidation and removal while preserving the saved setting", async () => {
        const fixture = policyFixture();
        let effective = resolveInstanceUrl("https://saved.example.com", undefined);
        const stop = watchManagedUrl(fixture.storage, (url) => {
            effective = resolveInstanceUrl("https://saved.example.com", url);
        });
        await flush();
        assert.equal(effective.managed, false);
        fixture.change("https://first.example.com");
        assert.equal(effective.address, "https://first.example.com");
        assert.equal(effective.managed, true);
        fixture.change("https://second.example.com/");
        assert.equal(effective.address, "https://second.example.com");
        fixture.change("bad");
        assert.equal(effective.address, "https://saved.example.com");
        assert.equal(effective.managed, false);
        fixture.change("https://second.example.com");
        fixture.change(undefined);
        assert.equal(effective.address, "https://saved.example.com");
        assert.equal(effective.managed, false);
        stop();
        assert.equal(fixture.listeners.size, 0);
    });

    it("ignores unrelated events and prevents a slow initial read from replacing a newer event", async () => {
        const fixture = policyFixture();
        let finish!: (value: Record<string, unknown>) => void;
        fixture.storage.managed = {
            get: () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        };
        const values: (string | undefined)[] = [];
        const stop = watchManagedUrl(fixture.storage, (url) => values.push(url));
        fixture.change("https://ignored.example.com", "sync");
        fixture.change("https://ignored.example.com", "managed", "OtherPolicy");
        assert.deepEqual(values, []);
        fixture.change("https://new.example.com");
        finish({ [POLICY_ONA_INSTANCE_URL]: "https://old.example.com" });
        await flush();
        assert.deepEqual(values, ["https://new.example.com"]);
        stop();
    });

    it("does not notify after unsubscribing during the initial read", async () => {
        const values: (string | undefined)[] = [];
        watchManagedUrl(policyFixture().storage, (url) => values.push(url))();
        await flush();
        assert.deepEqual(values, []);
    });
});

describe("instance hopping", () => {
    function savedFixture(enabled = true) {
        const data: Record<string, unknown> = {
            [STORAGE_KEY_ADDRESS]: "https://saved.example.com",
            [STORAGE_AUTOMATICALLY_DETECT_GITPOD]: enabled,
        };
        let writes = 0;
        return {
            data,
            get writes() {
                return writes;
            },
            storage: {
                get: async <T>(key: string) => data[key] as T,
                set: async (key: string, value: unknown) => {
                    data[key] = value;
                    writes++;
                    return null;
                },
            },
        };
    }

    it("never overwrites the user URL while managed, even when hopping was enabled", async () => {
        const saved = savedFixture();
        const policy = policyFixture("https://managed.example.com");
        await automaticallyUpdateEndpoint(saved.storage, policy.storage, "https://visited.example.com");
        policy.change("https://new-managed.example.com");
        await automaticallyUpdateEndpoint(saved.storage, policy.storage, "https://visited.example.com");
        assert.equal(saved.writes, 0);
        policy.change(undefined);
        assert.equal(
            resolveInstanceUrl(saved.data[STORAGE_KEY_ADDRESS] as string, await readManagedUrl(policy.storage)).address,
            "https://saved.example.com",
        );
        await automaticallyUpdateEndpoint(saved.storage, policy.storage, "https://visited.example.com");
        assert.equal(saved.data[STORAGE_KEY_ADDRESS], "https://visited.example.com");
        assert.equal(saved.data[STORAGE_AUTOMATICALLY_DETECT_GITPOD], true);
    });

    it("continues hopping with absent or invalid policy", async () => {
        for (const policy of [undefined, "invalid", 123]) {
            const saved = savedFixture();
            await automaticallyUpdateEndpoint(
                saved.storage,
                policyFixture(policy).storage,
                "https://visited.example.com",
            );
            assert.equal(saved.data[STORAGE_KEY_ADDRESS], "https://visited.example.com");
        }
    });

    it("preserves opt-out and avoids redundant writes", async () => {
        const disabled = savedFixture(false);
        await automaticallyUpdateEndpoint(disabled.storage, policyFixture().storage, "https://visited.example.com");
        assert.equal(disabled.writes, 0);
        const same = savedFixture();
        await automaticallyUpdateEndpoint(same.storage, policyFixture().storage, "https://saved.example.com");
        assert.equal(same.writes, 0);
    });
});
