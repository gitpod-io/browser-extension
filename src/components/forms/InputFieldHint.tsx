import classNames from "classnames";
import React, { type FC, type PropsWithChildren } from "react";

type Props = {
    disabled?: boolean;
};
export const InputFieldHint: FC<PropsWithChildren<Props>> = ({ disabled = false, children }) => {
    return (
        <span
            className={classNames(
                "text-sm",
                disabled ? "text-gray-400 dark:text-gray-400" : "text-gray-500 dark:text-gray-400",
            )}
        >
            {children}
        </span>
    );
};