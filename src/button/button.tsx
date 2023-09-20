import { useEffect, useState, useRef } from "react";
import Logo from "react:./logo-mark.svg"
import type { SupportedApplication } from "./button-contributions";
import classNames from "classnames";
import { STORAGE_KEY_ADDRESS, STORAGE_KEY_NEW_TAB } from "~storage";
import { useStorage } from "@plasmohq/storage/hook";
import React from "react";

export interface GitpodButtonProps {
  application: SupportedApplication;
  additionalClassNames?: string[];
}

export const GitpodButton = ({ application, additionalClassNames }: GitpodButtonProps) => {
  const [address] = useStorage<string>(STORAGE_KEY_ADDRESS, "https://gitpod.io");
  const [openInNewTab] = useStorage<boolean>(STORAGE_KEY_NEW_TAB, false);

  const [showDropdown, setShowDropdown] = useState(false);
  const actions = [
    {
      href: address + "/?autostart=true#" + window.location.toString(),
      label: "Open",
    },
    {
      href: address + "/?autostart=false#" + window.location.toString(),
      label: "Open with options...",
    },
  ]
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const firstActionRef = useRef<HTMLAnchorElement | null>(null);

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

  useEffect(() => {
    if (showDropdown && firstActionRef.current) {
      firstActionRef.current.focus();
    }
  }, [showDropdown]);

  return (
    <div id="gitpod-btn-nav" title="Gitpod" className={classNames("gitpod-button", application, ...(additionalClassNames || []))}>
      <div className={classNames("button")}>
        <a
          className={classNames("button-part", "action")}
          href={actions[0].href}
          target={openInNewTab ? "_blank" : "_self"}
          rel="noreferrer"
        >
          <span className={classNames("action-label")}>
            <Logo className={classNames("action-logo")} width={14} height={14} />
            {actions[0].label}
          </span>
        </a>
        <button className={classNames("button-part", "action-chevron")} onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}>
          <svg width="18" viewBox="0 0 24 24" className={classNames("chevron-icon")}>
            <path d="M7 10L12 15L17 10H7Z"></path>
          </svg>
        </button>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} className={classNames("drop-down")} onKeyDown={(e) => {
          if (e.key === "Escape") {
            setShowDropdown(false);
          }
        }}>
          {actions.slice(1).map(action => (
            <a
              key={action.label}
              ref={action === actions[1] ? firstActionRef : null}
              className={classNames("drop-down-action", "button-part")}
              href={action.href}
              target={openInNewTab ? "_blank" : "_self"}
              rel="noreferrer"
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
