import puppeteer, { Browser, Page } from "puppeteer";
import { expect } from "chai";
import { describe, it, before, after } from 'mocha';
import { buttonContributions, isSiteSuitable } from "./button-contributions-copy.js";

describe("Platform Detection Tests", function () {
  let browser: Browser;
  let page: Page;

  before(async function () {
    browser = await puppeteer.launch({
      headless: "new",
    });
    page = await browser.newPage();
  });

  after(async function () {
    await browser.close();
  });

  async function testHost() {
    const all = buttonContributions.flatMap((x) => x.exampleUrls);
    for (const url of all) {
      console.debug(`Testing ${url}`);
      await page.goto(url);

      const foundMatch = await page.evaluate(() => isSiteSuitable());
      expect(foundMatch, `Expected to find a match for '${url}'`).to.be.true;
    }
  }

  it("should detect the platform", async function () {
    await testHost();
  }).timeout(30_000);
});

describe("Query Selector Tests", function () {
  let browser: Browser;
  let page: Page;

  before(async function () {
    browser = await puppeteer.launch({
      headless: "new",
    });
    page = await browser.newPage();
  });

  after(async function () {
    await browser.close();
  });

  async function resolveSelector(page: Page, selector: string) {
    if (selector.startsWith("xpath:")) {
      return (await page.$x(selector.slice(6)))[0] || null;
    } else {
      return page.$(selector);
    }
  }

  async function testContribution(url: string, id: string) {
    await page.goto(url);
    let foundMatch = false;
    for (const contr of buttonContributions) {
      if (contr.match && !contr.match.test(url)) {
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
      it.skip(`url (${url}) should only match '${contribs.id}'`, async function () {
        await testContribution(url, contribs.id);
      }).timeout(5000);
    }
  }

});

