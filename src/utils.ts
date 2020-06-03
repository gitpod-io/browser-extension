export function renderGitpodUrl(gitpodURL: string): string {
    const baseURL = `${window.location.protocol}//${window.location.host}`;
    return `${gitpodURL}/#${baseURL}` + window.location.pathname;
}
