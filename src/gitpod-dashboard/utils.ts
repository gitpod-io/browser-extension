/**
 * Checks if the current site is a Gitpod instance.
 */
export const isSiteGitpod = (): boolean => {
    return !!document.head.querySelector("meta[name=Gitpod]");
}
