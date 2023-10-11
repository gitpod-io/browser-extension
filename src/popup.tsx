import { useStorage } from "@plasmohq/storage/hook";
import { useCallback, useEffect, useState } from "react"
import { STORAGE_KEY_ADDRESS, STORAGE_KEY_ALWAYS_OPTIONS, STORAGE_KEY_NEW_TAB } from "~storage";
import { hostToOrigin, parseEndpoint } from "~utils/parse-endpoint";
import React from "react";

import "./popup.css"
import { InputField } from "~components/forms/InputField";
import { TextInput } from "~components/forms/TextInputField";
import { CheckboxInputField } from "~components/forms/CheckboxInputField";
import { ALL_ORIGINS_WILDCARD, DEFAULT_GITPOD_ENDPOINT } from "~constants";
import { browser } from "webextension-polyfill-ts";
import { Button } from "~components/forms/Button";

const canAccessAllSites = async () => {
  return await browser.permissions.contains({ origins: [ALL_ORIGINS_WILDCARD] });
}

const canAccessOrigin = async (origin: string) => {
  return await browser.permissions.contains({ origins: [origin] });
}

function IndexPopup() {
  const [error, setError] = useState<string>();

  const [storedAddress, setStoredAddress] = useStorage<string>(STORAGE_KEY_ADDRESS, "https://gitpod.io");
  const [address, setAddress] = useState<string>(storedAddress);
  const updateAddress = useCallback(async () => {
    try {
      const parsed = parseEndpoint(address);
      setError(undefined);

      const origin = hostToOrigin(parsed);

      const isPermittedOrigin = await canAccessOrigin(origin);
      if (!isPermittedOrigin) {
        const granted = await browser.permissions.request({ origins: [origin] });
        if (!granted) {
          setError("Permission to access this origin was not granted. Please try again.");
          return;
        } else {
          setError(undefined);
       }
      }
      setStoredAddress(parsed);

    } catch (e) {
      setError(e.message);
    }
  }, [address, setError]);

  // Need to update address when storage changes. This also applies for the initial load.
  useEffect(() => {
    setAddress(storedAddress);
  }, [storedAddress])

  const [openInNewTab, setOpenInNewTab] = useStorage<boolean>(STORAGE_KEY_NEW_TAB, true);
  const [allSites, setAllSites] = useState(false);

  useEffect(() => {
    (async () => {
      setAllSites(await canAccessAllSites());
    })()
  }, [])
  const [disableAutostart, setDisableAutostart] = useStorage<boolean>(STORAGE_KEY_ALWAYS_OPTIONS, false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: "360px",
        padding: "16px",
      }}
    >

      <form className="w-full" onSubmit={updateAddress} action="#">
        <InputField
          label="Gitpod URL"
          hint={`Gitpod instance URL, e.g. ${DEFAULT_GITPOD_ENDPOINT}.`}
          topMargin={false}
        >
          <div className="flex w-full max-w-sm items-center space-x-2">
            <TextInput
                  value={address}
                  onChange={setAddress}
                />
            <Button onClick={updateAddress}>Save</Button>
          </div>
        </InputField>
        <CheckboxInputField
          label="Open Workspaces in a new tab"
          checked={openInNewTab}
          onChange={setOpenInNewTab}
        />
        <CheckboxInputField
          label="Run on all sites"
          hint="Automatically add buttons for any detected self-hosted provider and Gitpod Dedicated"
          checked={allSites}
          onChange={async (checked) => {
            if (checked) {
              const granted = await browser.permissions.request({ origins: [ALL_ORIGINS_WILDCARD] });
              setAllSites(granted);
            } else {
              const success = await browser.permissions.remove({ origins: [ALL_ORIGINS_WILDCARD] });
              setAllSites(!success);
            }
          }}
        />
        <CheckboxInputField
          label="Always start with options"
          hint="Changes the primary button to always open with options"
          checked={disableAutostart}
          onChange={setDisableAutostart}
        />
      </form>

      {/* show error if set  */}
      <div style={
        error ? {
          color: "red",
          marginTop: "8px",
          display: "inline"
        } : {
          display: "none"
        }
      }
      >{error}
      </div>
    </div>
  )
}

export default IndexPopup
