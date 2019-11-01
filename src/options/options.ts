import { ConfigProvider } from "../config";

const SEPARATOR = ",";

const gitpodUrlInput = document.getElementById("gitpod-url-input")! as HTMLInputElement;
const domainPatternsInput = document.getElementById("injection-domains-input")! as HTMLInputElement;


const init = async () => {
    const configProvider = await ConfigProvider.create();

    // Initialize UI
    const initialConfig = configProvider.getConfig();
    gitpodUrlInput.value = initialConfig.gitpodURL;
    domainPatternsInput.value = initialConfig.injectIntoDomains.join(SEPARATOR);

    // Save config before close
    const saveOnType = (event: KeyboardEvent) => {
        if (event.isComposing || event.keyCode === 229) {
            return;
        }

        const domainPatternsStr = domainPatternsInput.value || "";
        const domainPatterns = domainPatternsStr.split(SEPARATOR);

        // Update config (propagated internally)
        configProvider.setConfig({
            gitpodURL: gitpodUrlInput.value || undefined,
            injectIntoDomains: domainPatterns,
        });
    };
    gitpodUrlInput.addEventListener("keyup", saveOnType);
    domainPatternsInput.addEventListener("keyup", saveOnType);
};

init().catch(err => console.error(err));