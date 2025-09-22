import React from "react";
import { BsTrash } from "react-icons/bs";
import classes from "./IconBtn.module.css";

const IconBtn = ({
  onClick = () => {},
  containerStyle = {},
  icon = <BsTrash color={"var(--white-color)"} size={16} />,
  title = "Delete",
  className = "",
}) => {
  return (
    <div
      className={[classes?.btnContainer, className].join(" ")}
      onClick={onClick}
      style={containerStyle}
      title={title}
    >
      {icon}
    </div>
  );
};

export default IconBtn;
