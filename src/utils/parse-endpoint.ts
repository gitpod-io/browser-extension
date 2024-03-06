import isUrl from "validator/es/lib/isURL";

const allowedProtocols = ["http:", "https:", "gitpod:"];

export const parseEndpoint = (input: string): string => {
    let url: URL;

    if (URL.canParse(input)) {
        url = new URL(input);

        if (!allowedProtocols.includes(url.protocol)) {
            throw new TypeError(`Invalid protocol in URL: ${input}`);
        }
    } else if (isUrl(input, { require_protocol: false, protocols: ["http", "https", "gitpod"] })) {
        url = new URL(`https://${input}`);
    } else {
        throw new TypeError(`Invalid URL: ${input}`);
    }

    return `${url.protocol}//${url.host}`;
};

export const hostToOrigin = (host: string): string => {
    const url = new URL(host);

    return url.origin + "/*";
};
