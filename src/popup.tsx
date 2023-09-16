import { useStorage } from "@plasmohq/storage/hook";
import { useCallback, useState } from "react"
import { storage_key } from "~storage";
import React from "react";

function validate(address: string) {
  if (!/^https?:\/\/[^/]+$/.test(address)) {
    return "Invalid address. Please provide a valid URL pointing to a Gitpod installation. It must not have any pathes or trailing slashes."
  }
  return undefined;
}

function IndexPopup() {
  const [address, setAddress] = useStorage<string>(storage_key, "https://gitpod.io");
  const [error, setError] = useState<string>();
  const updateAddress = useCallback((address: string) => {
    address = address.trim();
    address = address.endsWith("/") ? address.slice(0, -1) : address;
    const err = validate(address);
    setError(err);
    setAddress(address);
  }, [setAddress, setError]);

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
