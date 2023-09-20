import classNames from "classnames";
import React, { memo, type ReactNode, type PropsWithChildren } from "react";
import { InputFieldHint } from "./InputFieldHint";

type Props = {
    label?: ReactNode;
    id?: string;
    hint?: ReactNode;
    error?: ReactNode;
    topMargin?: boolean;
    className?: string;
    disabled?: boolean;
};

// eslint-disable-next-line react/display-name
export const InputField = memo(
    ({ label, id, hint, error, topMargin = true, className, children, disabled = false }: PropsWithChildren<Props>) => {
        return (
            <div className={classNames("flex flex-col space-y-2", { "mt-4": topMargin }, className)}>
                {label && (
                    <label
                        className={classNames(
                            "text-sm font-semibold",
                            disabled
                                ? "text-gray-400 dark:text-gray-400"
                                : error
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-600 dark:text-gray-100",
                        )}
                        htmlFor={id}
                    >
                        {label}
                    </label>
                )}
                {children}
                {error && <span className="text-red-500 text-sm">{error}</span>}
                {hint && <InputFieldHint>{hint}</InputFieldHint>}
            </div>
        );
    },
);