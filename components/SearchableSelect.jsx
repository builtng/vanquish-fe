'use client';

import React, { useContext, useState, useEffect, useId } from 'react';
import Select from 'react-select';
import { useTheme } from 'next-themes';

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  isDisabled = false,
  isMulti = false,
  required = false,
  ...props
}) => {
  const instanceId = useId();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Convert options to react-select format if needed
  const formattedOptions = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    if (option.value !== undefined && option.label !== undefined) {
      return option;
    }
    // Handle { value: 'x', text: 'y' } format
    return { value: option.value || option.id, label: option.label || option.text || option.name || option.value || option.id };
  });

  // Handle value conversion
  let selectedValue = null;
  if (value !== null && value !== undefined && value !== '') {
    if (isMulti) {
      selectedValue = Array.isArray(value)
        ? formattedOptions.filter(opt => value.includes(opt.value))
        : formattedOptions.filter(opt => opt.value === value);
    } else {
      selectedValue = formattedOptions.find(opt => opt.value === value || opt.value === String(value));
    }
  }

  const handleChange = (selectedOption) => {
    if (isMulti) {
      const values = selectedOption ? selectedOption.map(opt => opt.value) : [];
      onChange({ target: { value: values } });
    } else {
      const newValue = selectedOption ? selectedOption.value : '';
      onChange({ target: { value: newValue } });
    }
  };

  const isDark = mounted && resolvedTheme === 'dark';
  
  // Check if className contains error styling
  const hasError = className.includes('border-red-500') || className.includes('error');
  
  // Theme-aware colors using CSS variables
  const themeColors = {
    border: 'var(--input-border)',
    borderFocus: 'transparent',
    bg: 'var(--input-bg)',
    bgHover: 'var(--hover-bg)',
    text: 'var(--input-text)',
    placeholder: 'var(--input-placeholder)',
    selected: 'var(--accent-color)',
    multiValueBg: 'var(--purple-bg)',
    multiValueText: 'var(--purple-primary)',
    multiValueHover: 'var(--purple-primary)',
    menuBg: 'var(--card-bg)',
    menuBorder: 'var(--card-border)',
  };
  
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: themeColors.bg,
      borderColor: hasError 
        ? '#ef4444' 
        : state.isFocused 
        ? themeColors.borderFocus
        : themeColors.border,
      boxShadow: hasError
        ? '0 0 0 1px rgba(239, 68, 68, 0.5)'
        : state.isFocused 
        ? '0 0 0 2px rgba(111, 29, 86, 0.5)' 
        : 'none',
      '&:hover': {
        borderColor: hasError 
          ? '#ef4444' 
          : state.isFocused 
          ? themeColors.borderFocus
          : themeColors.border,
      },
      minHeight: '42px',
      borderRadius: '0.5rem',
      paddingLeft: '0.5rem',
      paddingRight: '0.5rem',
      color: themeColors.text,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? themeColors.selected
        : state.isFocused
        ? themeColors.bgHover
        : themeColors.bg,
      color: state.isSelected ? '#ffffff' : themeColors.text,
      cursor: 'pointer',
      '&:active': {
        backgroundColor: state.isSelected ? themeColors.selected : themeColors.bgHover,
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: themeColors.placeholder,
    }),
    singleValue: (base) => ({
      ...base,
      color: themeColors.text,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: themeColors.multiValueBg,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: themeColors.multiValueText,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: themeColors.multiValueText,
      '&:hover': {
        backgroundColor: themeColors.multiValueHover,
        color: '#ffffff',
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: themeColors.menuBg,
      borderColor: themeColors.menuBorder,
      zIndex: 9999,
    }),
  };

  return (
    <Select
      instanceId={instanceId}
      value={selectedValue}
      onChange={handleChange}
      options={formattedOptions}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isMulti={isMulti}
      isSearchable={true}
      isClearable={true}
      className={`react-select-container ${className}`}
      classNamePrefix="react-select"
      styles={customStyles}
      {...props}
    />
  );
};

export default SearchableSelect;

