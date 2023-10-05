import { useStorage } from "@plasmohq/storage/hook";
import { useCallback, useEffect, useState } from "react"
import { STORAGE_AUTOMATICALLY_DETECT_GITPOD, STORAGE_KEY_ADDRESS, STORAGE_KEY_NEW_TAB } from "~storage";
import { parseEndpoint } from "~utils/parse-endpoint";
import React from "react";

import "./popup.css"
import { InputField } from "~components/forms/InputField";
import { TextInput } from "~components/forms/TextInputField";
import { CheckboxInputField } from "~components/forms/CheckboxInputField";
import { ALL_ORIGINS_WILDCARD, DEFAULT_GITPOD_ENDPOINT } from "~constants";
import { browser } from "webextension-polyfill-ts";

const canAccessAllSites = async () => {
  return await browser.permissions.contains({ origins: [ALL_ORIGINS_WILDCARD] });
}

function IndexPopup() {
  const [error, setError] = useState<string>();

  const [storedAddress, setStoredAddress] = useStorage<string>(STORAGE_KEY_ADDRESS, "https://gitpod.io");
  const [address, setAddress] = useState<string>(storedAddress);
  const updateAddress = useCallback((address: string) => {
    setAddress(address);
    try {
      const parsed = parseEndpoint(address);
      setStoredAddress(parsed);
      setError(undefined);
    } catch (e) {
      setError(e.message);
    }
  }, [setStoredAddress, setError]);

  // Need to update address when storage changes. This also applies for the initial load.
  useEffect(() => {
    setAddress(storedAddress);
  }, [storedAddress])

  const [openInNewTab, setOpenInNewTab] = useStorage<boolean>(STORAGE_KEY_NEW_TAB, true);
  const [automaticallyDetect, setAutomaticallyDetect] = useStorage<boolean>(STORAGE_AUTOMATICALLY_DETECT_GITPOD, true);

  const [allSites, setAllSites] = useState(false);

  useEffect(() => {
    (async () => {
      setAllSites(await canAccessAllSites());
    })()
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: "360px",
        padding: "16px",
      }}
    >

      <form className="w-full">
        <InputField
          label="Gitpod URL"
          hint={`Gitpod instance URL, e.g. ${DEFAULT_GITPOD_ENDPOINT}.`}
          topMargin={false}
        >
          <div className="flex space-x-2">
            <div className="flex-grow">
              <TextInput
                value={address}
                onChange={updateAddress}
              />
            </div>
          </div>
        </InputField>
        <CheckboxInputField
          label="Open Workspaces in a new tab"
          checked={openInNewTab}
          onChange={setOpenInNewTab}
        />
        <CheckboxInputField
          label="Automatically switch to Gitpod Dedicated"
          hint="Upon visiting a Gitpod Dedicated instance, switch to it"
          checked={automaticallyDetect}
          onChange={setAutomaticallyDetect}
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
