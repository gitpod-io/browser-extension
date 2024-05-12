/**
 * Copyright (c) 2023 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import classNames from "classnames";
import React, { memo, useCallback, useId, type PropsWithChildren, type ReactNode } from "react";

import { InputField } from "./InputField";

type TextInputFieldTypes = "text" | "password" | "email" | "url";

type Props = {
    type?: TextInputFieldTypes;
    label?: ReactNode;
    value: string;
    id?: string;
    hint?: ReactNode;
    error?: ReactNode;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    topMargin?: boolean;
    containerClassName?: string;
    onChange: (newValue: string) => void;
    onBlur?: () => void;
};

// eslint-disable-next-line react/display-name
export const TextInputField = memo(
    ({
        type = "text",
        label,
        value,
        id,
        placeholder,
        hint,
        error,
        disabled = false,
        required = false,
        topMargin,
        containerClassName,
        onChange,
        onBlur,
    }: PropsWithChildren<Props>) => {
        const maybeId = useId();
        const elementId = id || maybeId;

        return (
            <InputField
                id={elementId}
                label={label}
                hint={hint}
                error={error}
                topMargin={topMargin}
                className={containerClassName}
            >
                <TextInput
                    id={elementId}
                    value={value}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={error ? "error" : ""}
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </InputField>
        );
    },
);

type TextInputProps = {
    type?: TextInputFieldTypes;
    value: string;
    className?: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    onChange?: (newValue: string) => void;
    onBlur?: () => void;
};

// eslint-disable-next-line react/display-name
export const TextInput = memo(
    ({
        type = "text",
        value,
        className,
        id,
        placeholder,
        disabled = false,
        required = false,
        onChange,
        onBlur,
    }: PropsWithChildren<TextInputProps>) => {
        const handleChange = useCallback(
            (e) => {
                onChange && onChange(e.target.value);
            },
            [onChange],
        );

        const handleBlur = useCallback(() => onBlur && onBlur(), [onBlur]);

        return (
            <input
                id={id}
                className={classNames(
                    "w-full text-base",
                    "block text-gray-600 dark:text-gray-400 dark:bg-gray-800 bg-white rounded-lg border border-gray-300 dark:border-gray-500 focus:border-gray-400 dark:focus:border-gray-400 focus:ring-0",
                    "py-2 px-3",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:border disabled:border-gray-200 dark:disabled:border-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500",
                    className,
                )}
                value={value}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        );
    },
);
