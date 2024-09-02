import React from "react";
import classNames from "classnames";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  color?: "primary" | "secondary" | "link" | "warning";
  elevated?: boolean;
}

const baseStyles = classNames(
  "inline-flex items-center relative",
  "gap-x-1.5 rounded-md",
  "px-3 py-2 text-sm font-semibold",
  "focus:outline-none focus:ring-2 focus:ring-offset-2"
);

const disabledStyles = classNames(
  "disabled:text-gray-400",
  "disabled:hover:bg-transparent disabled:bg-gray-200",
  "disabled:cursor-not-allowed disabled:hover:bg-gray-200"
);

const colorVariants = {
  primary: classNames(
    "bg-indigo-600 text-white",
    "hover:bg-indigo-500",
    "shadow-md hover:shadow-lg"
  ),
  warning: classNames(
    "bg-red-600 text-white",
    "hover:bg-red-500",
    "shadow-md hover:shadow-lg"
  ),
  secondary: classNames(
    "bg-gray-200 text-gray-900",
    "ring-1 ring-inset ring-gray-300",
    "hover:bg-gray-50"
  ),
  link: classNames("text-indigo-600", "hover:text-indigo-800"),
};

const elevatedStyles = classNames(
  "bg-white border border-gray-400",
  "shadow hover:bg-gray-100"
);

export default function Button({
  children,
  onClick,
  color = "primary",
  elevated = false,
  disabled,
}: ButtonProps) {
  const classes = classNames(
    baseStyles,
    colorVariants[color],
    { [elevatedStyles]: elevated },
    disabledStyles
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
