import React from 'react';

const SelectDropdown = ({ 
    label, 
    value, 
    onChange, 
    options = [],
    displayValue = value => value 
}) => (
    <div>
        <label>{label}: </label>
        <select
            value={value}
            onChange={onChange}
            style={{ background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
        >
            {options.map((option, index) => (
                <option key={index} value={option.value}>{option.label}</option>
            ))}
        </select>
        <span>{displayValue(value)}</span>
    </div>
);

export default SelectDropdown;