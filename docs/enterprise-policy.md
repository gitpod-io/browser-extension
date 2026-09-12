# Configure the Ona URL with Chrome enterprise policy

Deploy an extension version containing the `OnaInstanceUrl` policy schema before applying this policy. The Chrome Web Store extension ID is `dodmmooeoklaejobgleioelladacbeki`; confirm the installed ID at `chrome://extensions`. Unpacked builds can have a different ID.

`OnaInstanceUrl` is an optional string containing an absolute HTTP(S) origin, for example `https://ona.example.com` or `https://ona.example.com:8443/`. HTTPS is recommended. A trailing slash is normalized away. Credentials, non-root paths, query strings, fragments, whitespace, missing schemes, and other protocols are invalid. This policy does not test server reachability or authentication.

A valid policy takes precedence over the user's saved **Ona URL** and the built-in default (`https://app.ona.com`). The popup displays the effective URL, disables editing and saving, and explains that the administrator controls it. Automatic instance hopping is suspended. The saved user URL (`gitpod-installation-address`) and hopping preference are retained. Changes apply when Chrome delivers its managed-storage change event, including to already open settings and injected buttons. Removing the policy, or replacing it with an invalid value, restores the saved URL (or default) and normal hopping behavior on subsequent dashboard visits. No browser restart is needed.

## Sample configuration

For Google Chrome on Linux, an administrator can deploy a JSON file such as `/etc/opt/chrome/policies/managed/ona.json`:

```json
{
    "3rdparty": {
        "extensions": {
            "dodmmooeoklaejobgleioelladacbeki": {
                "OnaInstanceUrl": "https://ona.example.com"
            }
        }
    }
}
```

For Windows, create a `REG_SZ` value named `OnaInstanceUrl` with the URL as its data under:

```text
HKEY_LOCAL_MACHINE\Software\Policies\Google\Chrome\3rdparty\extensions\dodmmooeoklaejobgleioelladacbeki\policy
```

For a Google Admin console extension-policy JSON upload, use the value wrapper expected by that interface:

```json
{
    "OnaInstanceUrl": {
        "Value": "https://ona.example.com"
    }
}
```

These are extension policies, separate from browser-wide extension installation policies. See Chromium's [extension policy deployment instructions](https://www.chromium.org/administrators/configuring-policy-for-extensions/) for platform details.

## Verify and troubleshoot

1. Open `chrome://policy` and select **Reload policies**. Find the Ona extension section with the installed extension ID. Check that `OnaInstanceUrl` has the expected value and no policy errors. If it is missing, check the extension version, ID, policy scope, and deployment location.
2. Open Ona's extension popup. **Ona URL** should show the configured origin, with disabled editing and an administrator explanation. Automatic instance hopping should be disabled. Chrome validates the string type; the extension additionally validates URL syntax, so a string can appear in `chrome://policy` yet be ignored by the extension.
3. Visit a supported SCM repository. Check the **Open** and **Open with options...** link destinations, and the `Alt+G` shortcut. They should use the managed origin.
4. Change the policy URL and reload policies while leaving the popup or SCM page open. The displayed URL and links should update. Visit a different Ona instance with hopping previously enabled and confirm it cannot replace the managed URL.
5. Remove the policy and reload policies. Editing should become available and the previously saved user URL should return, or the built-in default if no URL was saved. An invalid policy value should also fall back.

## Host access is separate

Setting `OnaInstanceUrl` does **not** grant or request host permissions. Permissions previously granted for other domains are not revoked when policy changes or is removed. This extension makes no API requests to the configured Ona origin; it opens links and optionally runs dashboard detection on that page.

| Feature                                                                           | Required access and remaining action                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read policy and show settings                                                     | Uses the extension's `storage` permission. No access to the configured domain is required.                                                                                                                                                                                                                                 |
| Open / Open with options / `Alt+G`                                                | The destination Ona domain needs no extension host permission for ordinary navigation. The browser must be able to reach the instance, and users still need to authenticate. The source SCM page must allow the button content script to run.                                                                              |
| Inject SCM buttons                                                                | Bundled matches cover `github.com`, `gitlab.com`, `bitbucket.org`, and `dev.azure.com`. Users must allow site access if Chrome has withheld it. For a supported self-hosted SCM domain, visit it, right-click the Ona extension icon, select **Enable Ona on this domain**, and approve access. Reload the page if needed. |
| Dashboard extension detection (`extension-last-seen-active` / `extension-active`) | Bundled matches cover `gitpod.io`, `app.ona.com`, and `*.gitpod.cloud`. A custom Ona domain needs its own host access: visit the dashboard, use **Enable Ona on this domain**, approve, and reload if needed. The disabled URL Save button is not needed to grant access.                                                  |
| Automatic instance hopping                                                        | Suspended whenever a valid policy exists. Without policy, it still needs the user's opt-in, a detected Ona/Gitpod dashboard, and access to that dashboard domain.                                                                                                                                                          |

The **Run on all sites** setting offers a broader optional grant instead of per-domain grants. Administrators must separately ensure that Chrome extension/site-access restrictions permit the required SCM and dashboard domains; if restrictions block a permission request, users cannot bypass them with this policy. A managed URL alone does not provide a fully unattended custom-domain deployment. See Chrome's [permissions documentation](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions).

Firefox keeps its existing behavior when managed storage is absent or rejects reads. Chrome's policy deployment mechanisms and schema are not Firefox configuration instructions; Firefox provisions managed storage differently. See [Firefox managed storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/managed).

## Developer checks

Run `pnpm run test:unit` for precedence, validation, storage failures, live changes/removal, subscription races, and hopping regression tests. Run `pnpm test` to include the existing SCM browser tests. Build both targets with `pnpm build --target=chrome-mv3` and `pnpm build --target=firefox-mv3`. Confirm the generated manifest's `storage.managed_schema` points to a packaged JSON file. After building Chrome, run `pnpm run test:policy-ui` to check the packaged popup in Chromium with mocked policy events and real user storage, including that policy changes do not request host permissions. The browser deployment steps above verify real enterprise policy delivery separately from mocked storage tests.
