# Gitpod Browser extension
[![Setup Automated](https://img.shields.io/badge/setup-automated-blue?logo=gitpod)](https://gitpod.io/#https://github.com/gitpod-io/browser-extension)

This is the browser extension for Gitpod. It supports Chrome (see [Chrome Web Store](https://chrome.google.com/webstore/detail/dodmmooeoklaejobgleioelladacbeki/)), Firefox (see [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/gitpod/)) and Edge (see [how to install Chrome extensions](https://support.microsoft.com/help/4538971/microsoft-edge-add-or-remove-extensions)), and adds a **Gitpod** button to the configured GitLab, GitHub and Bitbucket installations (defaults to `gitlab.com`, `github.com` and `bitbucket.org`) which immediately creates a Gitpod workspace for the current Git context:

 ![Gitpodify](./docs/github-injected.png "Gitpodify")

## Build

### Chrome & Firefox

```
yarn install && yarn build && yarn package
```

### Safari

#### ⚠️ A machine running macOS and [Xcode 12+](https://developer.apple.com/xcode/) installed is required!

First, run the following to install dependencies and build the web extension:

```
yarn install && yarn build && yarn package
```

Then run the `build:safari` command to build the Safari extension around the web extension:

```
yarn build:safari
```

![Confirm Safari](./docs/safari-confirm.png "Confirm Safari")

Hit `enter` when presented with this screen.

`Xcode` will open the `Gitpod.xcodeproj` automatically if it's installed.

## Test

[Build](#build) the extension and
* unzip `gitpod.xpi` and load it as [“unpackaged extension” (Chrome)](https://developer.chrome.com/extensions/getstarted) or
* load `gitpod.xpi` as [“temporary add-on” (Firefox)](https://blog.mozilla.org/addons/2015/12/23/loading-temporary-add-ons/) or
* open `Gitpod/Gitpod.xcodeproj` and run the project with `cmd` + `r`. ⚠️ _Safari must have [**Allow Unsigned Extensions**](https://developer.apple.com/documentation/safariservices/safari_app_extensions/building_a_safari_app_extension) enabled._

The extension is active until the next restart of your browser.

## Publishing

- **Chrome:** Users that are member of the Google group [`gitpod-browser-extension`](https://groups.google.com/g/gitpod-browser-extension) are allowed to update new versions in the [Chrome Webstore Developer Dashboard](https://chrome.google.com/webstore/devconsole/11ad35cc-5b54-416a-a789-f091e1007648).
- **Firefox:** Login at https://addons.mozilla.org/ with user `info@typefox.io`.

