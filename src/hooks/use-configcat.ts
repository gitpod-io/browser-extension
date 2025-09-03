import { createConsoleLogger, LogLevel, PollingMode, User } from 'configcat-js';
import { ConfigCatProvider, useConfigCatClient, useFeatureFlag } from 'configcat-react';

const CONFIGCAT_SDK_KEY_PRODUCTION = 'configcat-sdk-1/ykHcCKiz4EKB7k23mNcvBw/ut0FmOIkA0a-Ife7zHC-qg';
const CONFIGCAT_SDK_KEY_DEV = 'configcat-sdk-1/ykHcCKiz4EKB7k23mNcvBw/4zALdAjwI0iIB4y4eWr-bQ';

const logger = createConsoleLogger(LogLevel.Warn);

export const configCatProviderConfig = {
    sdkKey: process.env.NODE_ENV === 'production' ? CONFIGCAT_SDK_KEY_PRODUCTION : CONFIGCAT_SDK_KEY_DEV,
    pollingMode: PollingMode.AutoPoll,
    options: {
        pollIntervalSeconds: 60,
        logger: logger,
        requestTimeoutMs: 30000,
    },
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

// Re-export commonly used hooks and components from configcat-react
export { ConfigCatProvider, useConfigCatClient, useFeatureFlag };
