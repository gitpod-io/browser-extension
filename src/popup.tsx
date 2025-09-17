import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { CheckIcon } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent, type PropsWithChildren } from "react";
import browser from "webextension-polyfill";
import { Button } from "~components/forms/Button";
import { CheckboxInputField } from "~components/forms/CheckboxInputField";
import { InputField } from "~components/forms/InputField";
import { TextInput } from "~components/forms/TextInputField";
import { ALL_ORIGINS_WILDCARD, DEFAULT_ONA_ENDPOINT } from "~constants";
import { ConfigCatProvider, useConfigCatConfig } from "~hooks/use-configcat";
import { useTemporaryState } from "~hooks/use-temporary-state";
import {
    STORAGE_AUTOMATICALLY_DETECT_GITPOD,
    STORAGE_KEY_ADDRESS,
    STORAGE_KEY_ALWAYS_OPTIONS,
    STORAGE_KEY_NEW_TAB,
} from "~storage";
import { hostToOrigin, isOnaEndpoint, parseEndpoint } from "~utils/parse-endpoint";
import { canAccessAllSites } from "~utils/permissions";
import "./popup.css";

const storage = new Storage();

const Animate = ({ children, on }: PropsWithChildren<{ on?: string }>) => {
    return on === undefined ?
        <div>{children}</div>
        // see popup.css for transition styles
        : <div className="fade-in" key={on}>
            {children}
        </div>;
};

function PopupContent() {
    const [error, setError] = useState<string>();
    
    const [storedAddress] = useStorage<string>(STORAGE_KEY_ADDRESS, DEFAULT_ONA_ENDPOINT);
    const isStoredAddressOna = isOnaEndpoint(storedAddress);
    const [address, setAddress] = useState<string>(storedAddress);
    const [justSaved, setJustSaved] = useTemporaryState(false, 2000);
    
    const updateAddress = useCallback(
        (e: FormEvent) => {
            e.preventDefault();

            try {
                const parsedAddress = parseEndpoint(address);
                const origin = hostToOrigin(parsedAddress);

                storage
                    .setItem(STORAGE_KEY_ADDRESS, parsedAddress)
                    .catch((e) => {
                        setError(e.message);
                    })
                    .then(() => {
                        setJustSaved(true);
                    });

                if (origin) {
                    browser.permissions.request({ origins: [origin] }).catch((e) => {
                        setError(e.message);
                    });
                }
            } catch (e) {
                setError(e.message);
            }
        },
        [address, setError],
    );

    // Need to update address when storage changes. This also applies for the initial load.
    useEffect(() => {
        setAddress(storedAddress);
    }, [storedAddress]);

    const [openInNewTab, setOpenInNewTab] = useStorage<boolean>(STORAGE_KEY_NEW_TAB, true);
    const [allSites, setAllSites] = useState(false);

    useEffect(() => {
        (async () => {
            setAllSites(await canAccessAllSites());
        })();
    }, []);
    const [disableAutostart, setDisableAutostart] = useStorage<boolean>(STORAGE_KEY_ALWAYS_OPTIONS, false);

    const [enableInstanceHopping, setEnableInstanceHopping] = useStorage<boolean>(
        STORAGE_AUTOMATICALLY_DETECT_GITPOD,
        false,
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minWidth: "360px",
                padding: "16px",
            }}
            className="ona"
        >
            <form className="w-full" onSubmit={updateAddress} action="#">
                <InputField
                    label={`Ona URL`}
                    hint={`Ona instance URL, e.g. ${DEFAULT_ONA_ENDPOINT}.`}
                    topMargin={false}
                >
                    <div className="flex w-full h-10 max-w-sm items-center space-x-2">
                        <TextInput className="h-full" value={address} onChange={setAddress} />
                        <Button type="primary" onClick={updateAddress} className="w-20 h-full">
                            <Animate on={justSaved ? "check" : "save"}>
                                <span>
                                    {justSaved ?
                                        <CheckIcon size={16} />
                                        : "Save"}
                                </span>
                            </Animate>
                        </Button>
                    </div>
                </InputField>
                <CheckboxInputField
                    label={`Open Environments in a new tab`}
                    checked={openInNewTab}
                    onChange={setOpenInNewTab}
                />
                <CheckboxInputField
                    label="Run on all sites"
                    hint="Automatically add buttons for any detected self-hosted SCM provider"
                    checked={allSites}
                    onChange={async (checked) => {
                        if (checked) {
                            const granted = await browser.permissions.request({
                                origins: [ALL_ORIGINS_WILDCARD],
                            });
                            setAllSites(granted);
                        } else {
                            const success = await browser.permissions.remove({
                                origins: [ALL_ORIGINS_WILDCARD],
                            });
                            setAllSites(!success);
                        }
                    }}
                />
                <CheckboxInputField
                    label="Always start with options"
                    hint="Changes the primary button to always open with options"
                    checked={isStoredAddressOna ? true : disableAutostart}
                    onChange={setDisableAutostart}
                    disabled={isStoredAddressOna}
                />
                <CheckboxInputField
                    label="Automatic instance hopping"
                    hint={`Changes the Ona URL automatically when an Ona instance is detected`}
                    checked={enableInstanceHopping}
                    onChange={setEnableInstanceHopping}
                />
            </form>

            {/* show error if set */}
            <div
                style={
                    error ?
                        {
                            color: "red",
                            marginTop: "8px",
                            display: "inline",
                        }
                        : {
                            display: "none",
                        }
                }
            >
                {error}
            </div>
        </div>
    );
}

function IndexPopup() {
    const { config, loading } = useConfigCatConfig();

    if (loading || !config) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: "360px",
                    padding: "16px",
                }}
                className="ona"
            >
                Loading...
            </div>
        );
    }

    return (
        <ConfigCatProvider {...config}>
            <PopupContent />
        </ConfigCatProvider>
    );
}

export default IndexPopup;
