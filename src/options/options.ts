import { ConfigProvider } from "../config";

const gitpodUrlInput = document.getElementById("gitpod-url-input")! as HTMLInputElement;
const gitpodPopupInput = document.getElementById("gitpod-open-as-popup")! as HTMLInputElement;
const messageElement = document.getElementById("message")! as HTMLDivElement;


const init = async () => {
    const configProvider = await ConfigProvider.create();

    // Initialize UI
    const initialConfig = configProvider.getConfig();
    gitpodUrlInput.value = initialConfig.gitpodURL;
    gitpodPopupInput.checked = initialConfig.openAsPopup;

    let timeout: number | undefined = undefined;

    // Save config before close
    const save = () => {
        // Update config (propagated internally)
        configProvider.setConfig({
            gitpodURL: gitpodUrlInput.value || undefined,
            openAsPopup: gitpodPopupInput.checked
        });
        if (timeout) {
            window.clearTimeout(timeout);
            timeout = undefined;
        }
        messageElement.innerText = "Saved.";
        timeout = window.setTimeout(() => { messageElement.innerText = ""; timeout = undefined }, 3000);
    };
    gitpodUrlInput.addEventListener("keyup", (event: KeyboardEvent) => {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }
        save() 
    });
    gitpodPopupInput.addEventListener('change', save);
};

init().catch(err => console.error(err));
