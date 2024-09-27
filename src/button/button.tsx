import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Logo from "react:./logo-mark.svg";

import { useStorage } from "@plasmohq/storage/hook";

import { DEFAULT_GITPOD_ENDPOINT, EVENT_CURRENT_URL_CHANGED } from "~constants";
import { STORAGE_KEY_ADDRESS, STORAGE_KEY_ALWAYS_OPTIONS, STORAGE_KEY_NEW_TAB } from "~storage";

import type { SupportedApplication } from "./button-contributions";
import { CaretForProvider } from "./CaretForProvider";

type Props = {
    application: SupportedApplication;
    additionalClassNames?: string[];
    contextParser?: (url: string) => string;
};
export const GitpodButton = ({ application, additionalClassNames, contextParser }: Props) => {
    const [address] = useStorage<string>(STORAGE_KEY_ADDRESS, DEFAULT_GITPOD_ENDPOINT);
    const [openInNewTab] = useStorage<boolean>(STORAGE_KEY_NEW_TAB, true);
    const [disableAutostart] = useStorage<boolean>(STORAGE_KEY_ALWAYS_OPTIONS, false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentHref, setCurrentHref] = useState(window.location.href);

    const linkRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        const handleUrlChange = () => {
            setCurrentHref(window.location.href);
        };

        document.addEventListener(EVENT_CURRENT_URL_CHANGED, handleUrlChange);

        return () => {
            document.removeEventListener(EVENT_CURRENT_URL_CHANGED, handleUrlChange);
        };
    }, []);

    const actions = useMemo(
        () => {
            const parsedHref = !contextParser ? currentHref : contextParser(currentHref);
            return [
                {
                    href: `${address}/?autostart=${!disableAutostart}#${parsedHref}`,
                    label: "Open",
                },
                {
                    href: `${address}/?autostart=false#${parsedHref}`,
                    label: "Open with options...",
                },
            ];
        },
        [address, disableAutostart, currentHref, contextParser],
    );
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
        document.addEventListener("click", handleDocumentClick);
        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    useEffect(() => {
        if (showDropdown && firstActionRef.current) {
            firstActionRef.current.focus();
        }
    }, [showDropdown]);

    const target = openInNewTab ? "_blank" : "_self";

    useHotkeys("alt+g", () => linkRef.current?.click(), [linkRef.current]);

    return (
        <div
            id="gitpod-btn-nav"
            title="Gitpod"
            className={classNames("gitpod-button", application, ...(additionalClassNames ?? []))}
        >
            <div className={classNames("button")}>
                <a
                    className={classNames("button-part", disableAutostart ? "action-no-options" : "action")}
                    href={actions[0].href}
                    target={target}
                    rel="noreferrer"
                    ref={linkRef}
                >
                    <span className={classNames("action-label")}>
                        <Logo className={classNames("action-logo")} width={14} height={14} />
                        {actions[0].label}
                    </span>
                </a>
                {!disableAutostart && (
                    <button
                        className={classNames("button-part", "action-chevron")}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown();
                        }}
                    >
                        <CaretForProvider provider={application} />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className={classNames("drop-down")}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setShowDropdown(false);
                        }
                    }}
                >
                    {actions.slice(1).map((action) => (
                        <a
                            key={action.label}
                            ref={action === actions[1] ? firstActionRef : null}
                            className={classNames("drop-down-action", "button-part")}
                            href={action.href}
                            target={target}
                            rel="noreferrer"
                        >
                            <span className={classNames("drop-down-label")}>{action.label}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};
