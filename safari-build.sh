#!/bin/bash

yarn install && yarn build && yarn package

xcrun safari-web-extension-converter . --app-name Gitpod --bundle-identifier io.gitpod.Gitpod