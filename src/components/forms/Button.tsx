import classNames from "classnames";
import React, { forwardRef, type FC, type ForwardedRef, type ReactNode } from "react";

export type ButtonProps = {
    type?: "primary" | "secondary" | "danger" | "danger.secondary" | "transparent";
    size?: "small" | "medium" | "block";
    disabled?: boolean;
    className?: string;
    autoFocus?: boolean;
    htmlType?: "button" | "submit" | "reset";
    icon?: ReactNode;
    children?: ReactNode;
    onClick?: ButtonOnClickHandler;
};

// Allow w/ or w/o handling event argument
type ButtonOnClickHandler = React.DOMAttributes<HTMLButtonElement>["onClick"] | (() => void);

// eslint-disable-next-line react/display-name
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            type = "primary",
            className,
            htmlType = "button",
            disabled = false,
            autoFocus = false,
            size,
            icon,
            children,
            onClick,
        },
        ref: ForwardedRef<HTMLButtonElement>,
    ) => {
        return (
            <button
                type={htmlType}
                className={classNames(
                    "inline-flex items-center whitespace-nowrap rounded-lg text-sm justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2",
                    type === "primary" ?
                        [
                            "text-gray-50 dark:text-gray-900 bg-[#1F1F1F] hover:bg-[#737373] dark:bg-[#FAFAFA] dark:hover:bg-[#A3A3A3]",
                        ]
                    :   null,
                    type === "secondary" ?
                        [
                            "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
                            "text-gray-500 dark:text-gray-100 hover:text-gray-600",
                        ]
                    :   null,
                    type === "danger" ? ["bg-red-600 hover:bg-red-700", "text-gray-100 dark:text-red-100"] : null,
                    type === "danger.secondary" ?
                        [
                            "bg-red-50 dark:bg-red-300 hover:bg-red-100 dark:hover:bg-red-200",
                            "text-red-600 hover:text-red-700",
                        ]
                    :   null,
                    type === "transparent" ?
                        [
                            "bg-transparent hover:bg-gray-600 hover:bg-opacity-10 dark:hover:bg-gray-200 dark:hover:bg-opacity-10",
                        ]
                    :   null,
                    {
                        "w-full": size === "block",
                        "cursor-default opacity-50 pointer-events-none": disabled,
                    },
                    className,
                )}
                ref={ref}
                disabled={disabled}
                autoFocus={autoFocus}
                onClick={onClick}
            >
                <ButtonContent icon={icon}>{children}</ButtonContent>
            </button>
        );
    },
);

// TODO: Consider making this a LoadingButton variant instead
type ButtonContentProps = {
    icon?: ReactNode;
    children?: ReactNode;
};
const ButtonContent: FC<ButtonContentProps> = ({ icon, children }) => {
    if (!icon) {
        return <span>{children}</span>;
    }

    return (
        <div className="flex items-center justify-center space-x-2">
            <span className="flex justify-center items-center w-5 h-5">{icon ? icon : null}</span>
            {children && <span>{children}</span>}
        </div>
    );
};
