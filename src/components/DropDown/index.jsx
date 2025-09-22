import React from 'react';
import CReactSelect from 'react-select/creatable';
import NReactSelect from 'react-select';

import { components } from 'react-select';
import classes from './DropDown.module.css';
import PropTypes from 'prop-types';
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';

const DropDown = ({
  options,
  label,
  labelTwo,
  customStyle,
  disabled,
  value,
  setter,
  noBorder,
  placeholder,
  isMulti,
  style,
  leftIcon,
  Components,
  labelClassName,
  indicatorColor = 'var(--label-color)',
  optionLabel,
  optionValue,
  variant = '',
  createAble,
  containerClass = '',
  ...props
}) => {
  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        {props.isFocused ? (
          <MdOutlineArrowDropUp size={30} color={indicatorColor} />
        ) : (
          <MdOutlineArrowDropDown size={30} color={indicatorColor} />
        )}
      </components.DropdownIndicator>
    );
  };

  const dropDownStyle = {
    control: (styles, { isFocused, isDisabled }) => ({
      ...styles,
      background:
        variant == 'web' ? 'var(--input-dropdown-color)' : 'var(--white-color)',
      padding: variant == 'web' ? '0px 4px' : '4px 0px 4px 4px',
      color: 'var(--text-color-black)',
      boxShadow: 'none',
      fontSize: '16px',
      letterSpacing: '1.4',
      cursor: 'pointer',
      border: 'none',
      boxShadow:
        variant == 'web'
          ? '3px 3px 2px 0px rgba(0, 0, 0, 0.15)'
          : '0px 0 5px 2px #0000000d',
      borderRadius: variant == 'web' ? '8px' : '10px',
      textTransform: 'capitialize',
      opacity: isDisabled ? '0.8' : '1',
      width: '100%',
      ...customStyle,

      ':hover': {
        ...styles[':hover'],
        borderColor: 'var(--main-color)',
      },
      ':placeholder': {
        ...styles[':placeholder'],
        color: 'var(--text-color-black)',
      },
      ':active': {
        ...styles[':active'],
        borderColor: 'var(--main-color)',
      },
    }),

    placeholder: (defaultStyles) => {
      return {
        ...defaultStyles,
        color: 'var(--placeholder-color)',
      };
    },

    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        background: isSelected && 'var(--primary-color)',
        color: isSelected && 'var(--white-color)',
        padding: '8px 12px',
        textTransform: 'capitialize',

        ':active': {
          ...styles[':active'],
        },
        ':hover': {
          ...styles[':hover'],
          color: 'var(--text-color-black)',
          backgroundColor: '#02528a85',
          cursor: 'pointer',
        },
      };
    },

    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: 'var(--primary-color)',
        borderRadius: '14px',
        padding: '1px 10px',
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: '#545774',
    }),
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      fontSize: 12,
      color: '#000',
      ':hover': {
        color: '#000',
      },
    }),
  };
  const ReactSelect = createAble ? CReactSelect : NReactSelect;
  return (
    <div className={`${[classes.Container, containerClass].join(' ')}`}>
      <style jsx>{`
        .DropdownOptionContainer__menu {
          margin: 0px;
          border: 0px;
        }
        .DropdownOptionContainer__single-value {
          color: var(--text-color-black);
        }
        .DropdownOptionContainer__menu {
          box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.25);
        }
      `}</style>
      {label && (
        <label
          htmlFor={`dropdown${label}`}
          className={` ${[
            classes.label,
            labelClassName && labelClassName,
            disabled && classes.disabled,
          ].join(' ')}`}
        >
          {label}
        </label>
      )}

      <div className={`${[classes.dropdownContainer].join(' ')}`}>
        <ReactSelect
          inputId={`dropdown${label}`}
          value={value}
          onChange={(e) => {
            setter(e);
          }}
          className={`${[classes.reactSelect].join(' ')}`}
          isMulti={isMulti}
          isDisabled={disabled}
          placeholder={placeholder}
          options={options}
          styles={{ ...dropDownStyle, ...style }}
          isClearable={false}
          classNamePrefix={'DropdownOptionContainer'}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: (e) => DropdownIndicator(e),
            ...Components,
          }}
          getOptionLabel={(option) => {
            return optionLabel ? option[optionLabel] : option.label;
          }}
          getOptionValue={(option) =>
            optionValue ? option[optionValue] : option.value
          }
          {...props}
        />
        {leftIcon && <div className={classes.leftIconBox}>{leftIcon}</div>}
      </div>
    </div>
  );
};

DropDown.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  labelTwo: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.object.isRequired,
  setter: PropTypes.object,
  disabled: PropTypes.bool,
  isMulti: PropTypes.bool,
  customStyle: PropTypes.object,
  style: PropTypes.object,
  Components: PropTypes.object,
  labelClassName: PropTypes.string,
};

DropDown.defaultProps = {
  placeholder: 'sdsad',
  value: 'aaaa',
  disabled: false,
  isMulti: false,
  options: [],
  Components: {},
};

export default DropDown;
