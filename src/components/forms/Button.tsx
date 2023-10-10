import classNames from "classnames"
import React, {
  forwardRef,
  type FC,
  type ForwardedRef,
  type ReactNode
} from "react"

export type ButtonProps = {
  type?: "primary" | "secondary" | "danger" | "danger.secondary" | "transparent"
  size?: "small" | "medium" | "block"
  spacing?: "compact" | "default"
  disabled?: boolean
  className?: string
  autoFocus?: boolean
  htmlType?: "button" | "submit" | "reset"
  icon?: ReactNode
  children?: ReactNode
  onClick?: ButtonOnClickHandler
}

// Allow w/ or w/o handling event argument
type ButtonOnClickHandler =
  | React.DOMAttributes<HTMLButtonElement>["onClick"]
  | (() => void)

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
      spacing = "default",
      icon,
      children,
      onClick
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        type={htmlType}
        className={classNames(
          "cursor-pointer my-auto",
          "text-sm font-medium whitespace-nowrap",
          "rounded-xl focus:outline-none focus:ring transition ease-in-out",
          spacing === "compact" ? ["px-1 py-1"] : null,
          spacing === "default" ? ["px-4 py-2"] : null,
          type === "primary"
            ? [
                "bg-gray-900 hover:bg-gray-800 dark:bg-kumquat-base dark:hover:bg-kumquat-ripe",
                "text-gray-50 dark:text-gray-900"
              ]
            : null,
          type === "secondary"
            ? [
                "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600",
                "text-gray-500 dark:text-gray-100 hover:text-gray-600"
              ]
            : null,
          type === "danger"
            ? ["bg-red-600 hover:bg-red-700", "text-gray-100 dark:text-red-100"]
            : null,
          type === "danger.secondary"
            ? [
                "bg-red-50 dark:bg-red-300 hover:bg-red-100 dark:hover:bg-red-200",
                "text-red-600 hover:text-red-700"
              ]
            : null,
          type === "transparent"
            ? [
                "bg-transparent hover:bg-gray-600 hover:bg-opacity-10 dark:hover:bg-gray-200 dark:hover:bg-opacity-10"
              ]
            : null,
          {
            "w-full": size === "block",
            "cursor-default opacity-50 pointer-events-none": disabled
          },
          className
        )}
        ref={ref}
        disabled={disabled}
        autoFocus={autoFocus}
        onClick={onClick}>
        <ButtonContent icon={icon}>{children}</ButtonContent>
      </button>
    )
  }
)

// TODO: Consider making this a LoadingButton variant instead
type ButtonContentProps = {
  icon?: ReactNode
  children?: ReactNode
}
const ButtonContent: FC<ButtonContentProps> = ({ icon, children }) => {
  if (!icon) {
    return <span>{children}</span>
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <span className="flex justify-center items-center w-5 h-5">
        {icon ? icon : null}
      </span>
      {children && <span>{children}</span>}
    </div>
  )
}
