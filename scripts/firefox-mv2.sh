#!/bin/bash

jq '.manifest.optional_permissions = .manifest.optional_host_permissions | del(.manifest.optional_host_permissions)' package.json > temp.json && mv temp.json package.json # fix incompatibility with Firefox's MV3 implementation. See https://bugzilla.mozilla.org/show_bug.cgi?id=1766026
