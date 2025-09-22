import React from "react";
import classes from "./LabelAndValue.module.css";

function LabelAndValue({ label, value, valueClass = "text-capitalize" }) {
  return (
    <div className={[classes?.labelAndValue, "dark:text-white"].join(" ")}>
      <label>{`${label}:`}</label> &nbsp;
      <span className={valueClass}>{value}</span>
    </div>
  );
}

export default LabelAndValue;
