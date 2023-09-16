import { useEffect, useState, useRef } from "react";
import Logo from "react:./logo-mark.svg"
import type { SupportedApplication } from "./button-contributions";
import classNames from "classnames";
import { storage_key } from "~storage";
import { useStorage } from "@plasmohq/storage/hook";
import React from "react";

export interface GitpodButtonProps {
  application: SupportedApplication;
  additionalClassNames?: string[];
}

export const GitpodButton = ({ application, additionalClassNames }: GitpodButtonProps) => {
  const [address] = useStorage<string>(storage_key, "https://gitpod.io");
  const [showDropdown, setShowDropdown] = useState(false);
  const actions = [
    {
      href: address + "/?autostart=true#" + window.location.toString(),
      label: "Open",
    },
    {
      href: address + "/?autostart=false#" + window.location.toString(),
      label: "Open with Options ...",
    },
  ]
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDocumentClick = (event: Event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <div id="gitpod-btn-nav" title="Gitpod" className={classNames("gitpod-button", application, ...(additionalClassNames || []))}>
      <div className={classNames("button")}>
        <a className={classNames("button-part", "action")} href={actions[0].href}>
          <span className={classNames("action-label")}>
            <Logo className={classNames("action-logo")} width={14} height={14}/>
            {actions[0].label}
          </span>
        </a>
        <div className={classNames("button-part", "action-chevron")} onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}>
          <svg width="18" viewBox="0 0 24 24" className={classNames("chevron-icon")}>
            <path d="M7 10L12 15L17 10H7Z"></path>
          </svg>
        </div>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} className={classNames("drop-down")}>
          {actions.slice(1).map(action => (
            <a
              key={action.label}
              className={classNames("drop-down-action", "button-part")}
              href={action.href}
            >
              <span className={classNames("drop-down-label")}>
                {action.label}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
