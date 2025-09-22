import PropTypes from "prop-types";
import classes from "./TextArea.module.css";

export default function TextArea({
  value,
  setter,
  label,
  placeholder,
  customStyle,
  labelStyle,
  rows = 5,
  className,
  tooltipText = "",
  variant = "",
  ...props
}) {
  return (
    <div className={classes.textAreaBox} data-variant={variant}>
      <div className={[classes?.labelAndTooltip].join(" ")}>
        {label && (
          <label className="dark:text-white" style={{ ...labelStyle }}>
            {label}
          </label>
        )}
      </div>
      <textarea
        placeholder={placeholder}
        value={value}
        style={{ ...customStyle }}
        onChange={(e) => {
          setter(e.target.value);
        }}
        className={className}
        rows={rows}
        {...props}
      />
    </div>
  );
}
TextArea.propTypes = {
  value: PropTypes.string,
  setter: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  customStyle: PropTypes.object,
  labelStyle: PropTypes.object,
};
