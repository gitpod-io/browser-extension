import { expect } from "chai";
import { hostToOrigin, parseEndpoint } from "./parse-endpoint";

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
        expect(() => parseEndpoint("https://")).to.throw(TypeError);
    });
});

describe("hostToOrigin", () => {
    it("converts hosts to origins", () => {
        expect(hostToOrigin("https://gitpod.io")).to.equal("https://gitpod.io/*");
        expect(hostToOrigin("http://localhost:3000")).to.equal("http://localhost:3000/*");
    });

    it("does not convert invalid hosts", () => {
        expect(hostToOrigin("ftp://gitpod.io")).to.be.undefined;
        expect(hostToOrigin("gitpod://")).to.be.undefined;
    });
});
