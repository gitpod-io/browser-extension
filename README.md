# Gitpod Browser extension
[![Setup Automated](https://img.shields.io/badge/setup-automated-blue?logo=gitpod)](https://gitpod.io/#https://github.com/gitpod-io/browser-extension)

This is the browser extension for Gitpod, supporting Chrome ([Chrome Web Store](https://chrome.google.com/webstore/detail/dodmmooeoklaejobgleioelladacbeki/)) and Firefox ([Firefox Add-ons](https://addons.mozilla.org/firefox/addon/gitpod/)). It adds a **Gitpod** button to the configured GitHub and GitLab installations (defaults to domains containing `github.com` or `gitlab.com`) which directly creates a workspace for that context:

 ![Gitpodify](./docs/github-injected.png "Gitpodify")

## Build

### Chrome & Firefox

```
yarn install && yarn build && yarn package
```

### Safari

#### ⚠️ A machine running macOS and [Xcode](https://developer.apple.com/xcode/) installed is required!

```
npm run build:safari
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
