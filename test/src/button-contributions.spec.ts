import puppeteer, { Browser, Page } from "puppeteer";
import { expect } from "chai";
import { describe, it, before, after } from 'mocha';
import { buttonContributions } from "./button-contributions-copy.js";

describe("Query Selector Tests", function() {
  let browser: Browser;
  let page: Page;

  before(async function() {
    browser = await puppeteer.launch({
      headless: "new",
    });
    page = await browser.newPage();
  });

  after(async function() {
    await browser.close();
  });

  async function testContribution(url: string, id: string) {
    await page.goto(url);
    let foundMatch = false;
    for (const contr of buttonContributions) {
      if (contr.match && !contr.match.test(url)) {
        continue;
      }
      const element = await page.$(contr.selector);
      if (contr.id === id) {
        expect(element, `Expected '${id}' to match on ${url}`).to.not.be.null;
        foundMatch = true;
      } else {
        expect(element, `Did not expect '${contr.id}' to match on ${url}`).to.be.null;
      }
    }
    expect(foundMatch, `Expected to find a match for '${id}' on ${url}`).to.be.true;
  }

  for (const contribs of buttonContributions) {
    for (const url of contribs.exampleUrls) {
      it("url ("+url+") should only match '" + contribs.id +"'" , async function() {
        await testContribution(url, contribs.id);
      }).timeout(5000);
    }
  }

});

