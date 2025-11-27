'use client';

import React from 'react';
import Select from 'react-select';

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

  // Check if className contains error styling
  const hasError = className.includes('border-red-500') || className.includes('error');
  
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: hasError 
        ? '#ef4444' 
        : state.isFocused 
        ? 'transparent' 
        : '#d1d5db',
      boxShadow: hasError
        ? '0 0 0 1px rgba(239, 68, 68, 0.5)'
        : state.isFocused 
        ? '0 0 0 2px rgba(147, 51, 234, 0.5)' 
        : 'none',
      '&:hover': {
        borderColor: hasError 
          ? '#ef4444' 
          : state.isFocused 
          ? 'transparent' 
          : '#d1d5db',
      },
      minHeight: '42px',
      borderRadius: '0.5rem',
      paddingLeft: '0.5rem',
      paddingRight: '0.5rem',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#9333ea'
        : state.isFocused
        ? '#f3e8ff'
        : 'white',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: state.isSelected ? '#9333ea' : '#e9d5ff',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#111827',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#f3e8ff',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#9333ea',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#9333ea',
      '&:hover': {
        backgroundColor: '#e9d5ff',
        color: '#7c3aed',
      },
    }),
  };

  return (
    <Select
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

