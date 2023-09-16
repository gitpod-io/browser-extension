#!/bin/bash

ROOT=/workspace/browser-extension
cd $ROOT/dev/http-file-sync

echo "building binaries ..."
go build -o $ROOT/.bin/watch-sync
GOARCH=amd64 GOOS=darwin go build -o $ROOT/.bin/watch-sync-osx-x86_64
GOARCH=arm64 GOOS=darwin go build -o $ROOT/.bin/watch-sync-osx-arm64