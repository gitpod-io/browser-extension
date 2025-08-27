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

export const hostToOrigin = (host: string): string | undefined => {
    const { origin, protocol } = new URL(host);
    if (origin === "null" || !["http:", "https:"].includes(protocol)) {
        return undefined;
    }

    return `${origin}/*`;
};

export const isOnaEndpoint = (url: string): boolean => {
    const parsedUrl = new URL(url);
    

    return parsedUrl.hostname === "app.ona.com" || parsedUrl.hostname === "app.gitpod.io";
};