export function renderGitpodUrl(gitpodURL: string): string {
    const baseURL = `${window.location.protocol}//${window.location.host}`;
    return `${gitpodURL}/#${baseURL}` + window.location.pathname;
}

export function makeOpenInPopup(a: HTMLAnchorElement): void {
    a.onclick = () => {
        const w = window.open(a.href, a.target, 'menubar=no,toolbar=no,location=no,dependent');
        return !w;
    }
}