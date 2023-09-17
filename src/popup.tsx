import { useStorage } from "@plasmohq/storage/hook";
import { useCallback, useEffect, useState } from "react"
import { STORAGE_KEY_ADDRESS, STORAGE_KEY_NEW_TAB } from "~storage";
import { parseEndpoint } from "~utils/parse-endpoint";
import React from "react";

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

  const [openInNewTab, setOpenInNewTab] = useStorage<boolean>(STORAGE_KEY_NEW_TAB, false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        color: "#555",
        minWidth: "400px",
        padding: "16px",
      }}>
      <h1>
        Settings
      </h1>

      <form style={{
        display: "flex",
        flexDirection: "column",
      }}>
        <label>
          Gitpod installation address
          <input style={{
            borderRadius: "4px",
            padding: "14px 14px",
            color: "#555",
            borderColor: "#555",
            borderStyle: "solid",
            borderWidth: "1px",
          }} onChange={(e) => updateAddress(e.target.value)} value={address} />
        </label>
        <label>
          <span>Open Workspaces in a new tab</span>
          <input type="checkbox" checked={openInNewTab} onChange={(e) => setOpenInNewTab(e.target.checked)} />
        </label>
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
      </form>
    </div>
  )
}

export default IndexPopup
