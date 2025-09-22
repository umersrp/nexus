import React from 'react';
import classes from './CustomPhoneInput.module.css';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const CustomPhoneInput = ({
  value,
  setter,
  placeholder = 'Phone',
  disabled,
  label,
}) => {
  return (
    <>
      <style>{`
    .react-tel-input .flag-dropdown{
      border:none !important;
    }
   
    `}</style>
      <div>
        {label && (
          <p
            className={[
              classes.phoneLabel,
              disabled && classes.labelDisabled,
            ].join(' ')}
          >
            {label}
          </p>
        )}
        <ReactPhoneInput
          inputClass={[classes.phoneInput]}
          containerClass={[classes.phoneInputContainer]}
          placeholder={placeholder}
          enableSearch={true}
          value={value}
          onChange={(phone, a) => {
            setter({ no: phone, dialCode: a?.dialCode });
          }}
          disabled={disabled}
          inputStyle={{
            ...(disabled && { background: 'var(--disabled-input-color)' }),
          }}
        />
      </div>
    </>
  );
};

export default CustomPhoneInput;
