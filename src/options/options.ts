import { ConfigProvider } from "../config";

const gitpodUrlInput = document.getElementById("gitpod-url-input")! as HTMLInputElement;
const messageElement = document.getElementById("message")! as HTMLDivElement;


const init = async () => {
    const configProvider = await ConfigProvider.create();

    // Initialize UI
    const initialConfig = configProvider.getConfig();
    gitpodUrlInput.value = initialConfig.gitpodURL;

    let timeout: number | undefined = undefined;

    // Save config before close
    const saveOnType = (event: KeyboardEvent) => {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        // Update config (propagated internally)
        configProvider.setConfig({
            gitpodURL: gitpodUrlInput.value || undefined,
        });
        if (timeout) {
            window.clearTimeout(timeout);
            timeout = undefined;
        }
        messageElement.innerText = "Saved.";
        timeout = window.setTimeout(() => { messageElement.innerText = ""; timeout = undefined }, 3000);
    };
    gitpodUrlInput.addEventListener("keyup", saveOnType);
};

init().catch(err => console.error(err));
