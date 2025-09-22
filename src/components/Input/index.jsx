import React, { useState } from "react";
import classes from "./styles.module.css";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const Input = ({
  type,
  label,
  value,
  setter,
  noBorder,
  placeholder = "Enter here...",
  disabled,
  leftIcon,
  rightIcon,
  labelColor = "",
  labelClassName = "",
  inputContainerClass = "",
  ...props
}) => {
  const [passToggle, setPassToggle] = useState(false);
  let inputContainerStyleObject = Object.assign(
    {},
    leftIcon && { paddingLeft: "50px" }
  );
  return (
    <>
      <div className={`${[classes.Container].join(" ")}`}>
        {label && (
          <label
            htmlFor={`input${label}`}
            className={`  ${[
              classes.labelText,
              labelClassName,
              disabled && classes.disabled,
            ].join(" ")}`}
            style={{
              ...(labelColor && { color: labelColor }),
            }}
          >
            {label}
          </label>
        )}
        <div
          className={`${[classes.inputPassContainer, inputContainerClass].join(
            " "
          )}`}
        >
          {leftIcon && <div className={classes.leftIconBox}>{leftIcon}</div>}
          <input
            value={value}
            onChange={(e) => {
              setter(e.target.value);
            }}
            disabled={disabled}
            placeholder={placeholder}
            type={passToggle == true ? "text" : type}
            id={`input${label}`}
            className={` ${[classes.inputBox].join(" ")}`}
            style={{ ...inputContainerStyleObject }}
            {...props}
          />
          {rightIcon && <div className={classes.rightIcon}>{rightIcon}</div>}

          {type == "password" && passToggle == false && (
            <MdVisibilityOff
              className={classes.passwordIcon}
              onClick={(e) => setPassToggle(!passToggle)}
            />
          )}
          {type == "password" && passToggle && (
            <MdVisibility
              className={classes.passwordIcon}
              onClick={(e) => setPassToggle(!passToggle)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Input;
