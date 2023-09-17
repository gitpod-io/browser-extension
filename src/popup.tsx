import { useStorage } from "@plasmohq/storage/hook";
import { useCallback, useEffect, useState } from "react"
import { storage_key } from "~storage";
import { parseEndpoint } from "~utils/parse-endpoint";
import React from "react";

function IndexPopup() {
  const [storedAddress, setStoredAddress] = useStorage<string>(storage_key, "https://gitpod.io");
  const [address, setAddress] = useState<string>(storedAddress);
  const [error, setError] = useState<string>();
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

      <h2>
        Gitpod installation address
      </h2>
      <input style={{
        borderRadius: "4px",
        padding: "14px 14px",
        color: "#555",
        borderColor: "#555",
        borderStyle: "solid",
        borderWidth: "1px",
      }} onChange={(e) => updateAddress(e.target.value)} value={address} />
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
