# Gitpod Browser extension
[![Setup Automated](https://img.shields.io/badge/setup-automated-blue?logo=gitpod)](https://gitpod.io/#https://github.com/gitpod-io/browser-extension)

This is the browser extension for Gitpod. It supports Chrome (see [Chrome Web Store](https://chrome.google.com/webstore/detail/dodmmooeoklaejobgleioelladacbeki/)), Firefox (see [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/gitpod/)) and Edge (see [how to install Chrome extensions](https://support.microsoft.com/help/4538971/microsoft-edge-add-or-remove-extensions)), and adds a **Gitpod** button to the configured GitLab, GitHub and Bitbucket installations (defaults to `gitlab.com`, `github.com` and `bitbucket.org`) which immediately creates a Gitpod workspace for the current Git context:

 ![Gitpodify](./docs/github-injected.png "Gitpodify")

## Build

```
yarn install && yarn build && yarn package
```

## Test

[Build](#build) the extension and
* unzip `gitpod.xpi` and load it as [“unpackaged extension” (Chrome)](https://developer.chrome.com/extensions/getstarted) or
* load `gitpod.xpi` as [“temporary add-on” (Firefox)](https://blog.mozilla.org/addons/2015/12/23/loading-temporary-add-ons/).

The extension is active until the next restart of your browser.
