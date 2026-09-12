import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

test("packaged popup follows live policy without saving it or requesting host permissions", async () => {
    const extension = fileURLToPath(new URL("../build/chrome-mv3-prod", import.meta.url));
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", `--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
        const worker = await browser.waitForTarget((target) => target.type() === "service_worker");
        const id = new URL(worker.url()).host;
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));

        // Use real extension storage for user preferences and mock only policy delivery.
        await page.evaluateOnNewDocument(() => {
            const { chrome } = window;
            const listeners = new Set();
            const add = chrome.storage.onChanged.addListener.bind(chrome.storage.onChanged);
            const remove = chrome.storage.onChanged.removeListener.bind(chrome.storage.onChanged);
            chrome.storage.onChanged.addListener = (listener) => {
                listeners.add(listener);
                add(listener);
            };
            chrome.storage.onChanged.removeListener = (listener) => {
                listeners.delete(listener);
                remove(listener);
            };
            let policy = "https://managed.example.com";
            chrome.storage.managed.get = (_key, callback) => callback({ OnaInstanceUrl: policy });
            window.changePolicy = (value) => {
                const oldValue = policy;
                policy = value;
                listeners.forEach((listener) => listener({ OnaInstanceUrl: { oldValue, newValue: value } }, "managed"));
            };
            window.permissionRequests = 0;
            chrome.permissions.request = () => {
                window.permissionRequests++;
                throw new Error("Unexpected permission request");
            };
        });
        await page.goto(`chrome-extension://${id}/popup.html`);
        await page.evaluate(() =>
            window.chrome.storage.sync.set({
                "gitpod-installation-address": JSON.stringify("https://saved.example.com"),
                "gitpod-installation-automatically-detect-gitpod": JSON.stringify(true),
            }),
        );

        const expectState = async (url, managed) => {
            await page.waitForFunction(
                (expectedUrl, expectedManaged) => {
                    const input = document.querySelector("input[type=text]");
                    const save = document.querySelector("button");
                    const hopping = [...document.querySelectorAll("input[type=checkbox]")].at(-1);
                    return (
                        input?.value === expectedUrl &&
                        input.disabled === expectedManaged &&
                        save?.disabled === expectedManaged &&
                        hopping?.disabled === expectedManaged &&
                        hopping.checked === !expectedManaged
                    );
                },
                {},
                url,
                managed,
            );
        };

        await expectState("https://managed.example.com", true);
        assert.match(await page.evaluate(() => document.body.innerText), /administrator controls the Ona URL/);
        await page.evaluate(() => window.changePolicy("https://updated.example.com/"));
        await expectState("https://updated.example.com", true);
        await page.evaluate(() => window.changePolicy("invalid"));
        await expectState("https://saved.example.com", false);
        await page.evaluate(() => window.changePolicy("https://managed.example.com"));
        await expectState("https://managed.example.com", true);
        await page.evaluate(() => window.changePolicy(undefined));
        await expectState("https://saved.example.com", false);

        const saved = await page.evaluate(() => window.chrome.storage.sync.get("gitpod-installation-address"));
        assert.equal(saved["gitpod-installation-address"], JSON.stringify("https://saved.example.com"));
        assert.equal(await page.evaluate(() => window.permissionRequests), 0);
        assert.deepEqual(errors, []);
    } finally {
        await browser.close();
    }
});
