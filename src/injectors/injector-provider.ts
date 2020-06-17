import { Injector } from "./injector";
import { GitHubInjector } from "./github-injector";
import { ConfigProvider } from "../config";
import { GitlabInjector } from "./gitlab-injector";
import { BitbucketInjector } from "./bitbucket-injector";

export class InjectorProvider {
    protected injectors: Injector[];

    constructor(configProvider: ConfigProvider) {
        this.injectors = [
            new GitHubInjector(configProvider),
            new GitlabInjector(configProvider),
            new BitbucketInjector(configProvider)
        ];
    }

    public findInjectorForCurrentPage(): Injector | undefined {
        for (const injector of this.injectors) {
            if (injector.canHandleCurrentPage()) {
                return injector;
            }
        }
        return undefined;
    }
}