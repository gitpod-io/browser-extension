import isUrl from "validator/es/lib/isURL"

export const parseEndpoint = (input: string): string => {
  let url: URL

  if (isUrl(input, { require_protocol: true, protocols: ["https"] })) {
    url = new URL(input)
  } else if (isUrl(input, { require_protocol: false, protocols: ["https"] })) {
    url = new URL(`https://${input}`)
  } else {
    throw new TypeError(`Invalid URL: ${input}`)
  }

  return `${url.protocol}//${url.host}`
}
