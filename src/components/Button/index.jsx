"use client";
import { useRouter } from "next/navigation";
import classes from "./button.module.css";

const Button = ({
  label,
  customStyle,
  onClick,
  disabled,
  children,
  className = "",
  leftIcon,
  rightIcon,
  width,
  background,
  color,
  variant = "",
  path = "",
  ...props
}) => {
  const router = useRouter();
  return (
    <>
      <button
        className={`${[
          classes.btn,
          className,
          `${variant == "secondary" ? "dark:!text-white !text-black" : ""}`,
        ].join(" ")}`}
        style={customStyle && customStyle}
        onClick={() => (!!path ? router.push(path) : onClick && onClick())}
        disabled={disabled ? disabled : false}
        data-variant={variant}
        {...props}
      >
        {leftIcon && leftIcon}
        {label && label}
        {children && children}
        {rightIcon && rightIcon}
      </button>
    </>
  );
};

export default Button;
