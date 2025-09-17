import { expect } from "chai";
import { after, before, describe, it } from "mocha";
import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";

import { buttonContributions } from "./button-contributions-copy.js";

describe("Platform match tests", function () {
    let browser: Browser;
    let page: Page;

    before(async function () {
        browser = await puppeteer.launch({
            headless: true,
        });
        page = await browser.newPage();
    });

    after(async function () {
        await browser.close();
    });

    async function testHost() {
        const all = buttonContributions.flatMap((x) => x.exampleUrls);
        for (const url of all) {
            it(`should detect the platform for ${url}`, async function () {
                await page.goto(url);

                const foundMatch = await page.evaluate(() => {
                    const resolveMetaAppName = (head: HTMLHeadElement): string | undefined => {
                        const metaApplication = head.querySelector("meta[name=application-name]");
                        const ogApplication = head.querySelector("meta[property='og:site_name']");

                        if (metaApplication) {
                            return metaApplication.getAttribute("content") || undefined;
                        } else if (ogApplication) {
                            return ogApplication.getAttribute("content") || undefined;
                        }

                        return undefined;
                    };

                    const isSiteSuitable = (): boolean => {
                        const appName = resolveMetaAppName(document.head);
                        if (!appName) {
                            return false;
                        }
                        const allowedApps = ["GitHub", "GitLab", "Bitbucket"];

                        return allowedApps.some((app) => appName.includes(app));
                    };

                    return isSiteSuitable();
                });
                expect(foundMatch, `Expected to find a match for '${url}'`).to.be.true;
            }).timeout(30_000);
        }
    }

    testHost();
});

describe("Query Selector Tests", function () {
    let browser: Browser;
    let page: Page;

    before(async function () {
        browser = await puppeteer.launch({
            headless: true,
        });
        page = await browser.newPage();
    });

    after(async function () {
        await browser.close();
    });

    async function resolveSelector(page: Page, selector: string): Promise<ElementHandle<Element> | null> {
        if (selector.startsWith("xpath:")) {
            const elements = await (page as any).$x(selector.slice(6));
            return elements[0] || null;
        } else {
            return page.$(selector);
        }
    }

    async function testContribution(url: string, id: string) {
        await page.goto(url);
        let foundMatch = false;
        for (const contr of buttonContributions) {
            if (typeof contr.match === "object" && !contr.match.test(url)) {
                continue;
            }
            const element = await resolveSelector(page, contr.selector);
            if (contr.id === id) {
                expect(element, `Expected '${id}' to match on ${url}`).to.not.be.null;
                foundMatch = true;
            } else {
                if (contr.exampleUrls.length === 0) return true;
                expect(element, `Did not expect '${contr.id}' to match on ${url}`).to.be.null;
            }
        }
        expect(foundMatch, `Expected to find a match for '${id}' on ${url}`).to.be.true;
    }

    for (const contribs of buttonContributions) {
        for (const url of contribs.exampleUrls) {
            it(`url (${url}) should only match '${contribs.id}'`, async function () {
                await testContribution(url, contribs.id);
            }).timeout(5000);
        }
    }
});
