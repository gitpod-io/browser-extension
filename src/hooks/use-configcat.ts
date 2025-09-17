import { useEffect, useState } from 'react';
import { createConsoleLogger, LogLevel, PollingMode, User } from 'configcat-js';
import { ConfigCatProvider, useConfigCatClient, useFeatureFlag } from 'configcat-react';
import { Storage } from '@plasmohq/storage';
import { DEFAULT_ONA_ENDPOINT } from '~constants';
import { STORAGE_KEY_ADDRESS } from '~storage';

const logger = createConsoleLogger(LogLevel.Warn);
const storage = new Storage();

// Function to get the management plane endpoint for ConfigCat proxy
const getConfigCatBaseUrl = async (): Promise<string> => {
    const storedAddress = await storage.getItem<string>(STORAGE_KEY_ADDRESS) || DEFAULT_ONA_ENDPOINT;
    return `${storedAddress}/feature-flags/configcat`;
};

export const createConfigCatProviderConfig = async () => {
    const baseUrl = await getConfigCatBaseUrl();
    
    return {
        sdkKey: 'configcat-proxy/default',
        pollingMode: PollingMode.AutoPoll,
        options: {
            baseUrl,
            pollIntervalSeconds: 60,
            logger: logger,
            requestTimeoutMs: 30000,
        },
    };
};

export const FeatureFlags = {
    ONA_ENABLED: 'is_ona_browser_extension_enabled',
} as const;

export type FeatureFlagKey = (typeof FeatureFlags)[keyof typeof FeatureFlags];

export function useFlag(
    key: FeatureFlagKey,
    defaultValue: boolean = false,
    user?: User
): { value: boolean; loading: boolean } {
    return useFeatureFlag(key, defaultValue, user);
}

// Hook to get ConfigCat configuration with management plane endpoint
export function useConfigCatConfig() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        createConfigCatProviderConfig().then((config) => {
            setConfig(config);
            setLoading(false);
        });
    }, []);

    return { config, loading };
}

// Re-export commonly used hooks and components from configcat-react
export { ConfigCatProvider, useConfigCatClient, useFeatureFlag };
