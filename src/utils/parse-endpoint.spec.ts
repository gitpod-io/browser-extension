import { expect } from "chai";
import { parseEndpoint } from "./parse-endpoint";

describe("parseEndpoint", () => {
    it("parses valid hosts", () => {
        expect(parseEndpoint("https://gitpod.io/new")).to.equal("https://gitpod.io");
        expect(parseEndpoint("gitpod.io")).to.equal("https://gitpod.io");
        expect(parseEndpoint("gitpod.io/new")).to.equal("https://gitpod.io");
        expect(parseEndpoint("gitpod://")).to.equal("gitpod://");
        expect(parseEndpoint("http://localhost:3000")).to.equal("http://localhost:3000");
    });

    it("does not parse invalid hosts", () => {
        expect(() => parseEndpoint("gitpod")).to.throw(TypeError);
        expect(() => parseEndpoint("ftp://gitpod.io")).to.throw(TypeError);
    });
});
