import classNames from "classnames";

import type { SupportedApplication } from "./button-contributions";

const BitbucketCaret = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" role="presentation">
            <path
                d="M8.292 10.293a1.009 1.009 0 000 1.419l2.939 2.965c.218.215.5.322.779.322s.556-.107.769-.322l2.93-2.955a1.01 1.01 0 000-1.419.987.987 0 00-1.406 0l-2.298 2.317-2.307-2.327a.99.99 0 00-1.406 0z"
                fill="currentColor"
                fillRule="evenodd"
            ></path>
        </svg>
    );
};

const GitHubCaret = () => {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            className="octicon octicon-triangle-down chevron-icon"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="currentColor"
        >
            <path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path>
        </svg>
    );
};

const GitLabCaret = () => {
    return (
        <svg
            className="s16 gl-icon gl-mr-0!"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                fill="currentColor"
            />
        </svg>
    );
};

type Props = {
    provider: SupportedApplication;
};
export const CaretForProvider = ({ provider }: Props) => {
    switch (provider) {
        case "github":
            return <GitHubCaret />;
        case "bitbucket":
        case "bitbucket-server":
            return <BitbucketCaret />;
        case "gitlab":
            return <GitLabCaret />;
        default:
            return (
                <svg width="16" viewBox="0 0 24 24" className={classNames("chevron-icon")}>
                    <path d="M7 10L12 15L17 10H7Z"></path>
                </svg>
            );
    }
};
