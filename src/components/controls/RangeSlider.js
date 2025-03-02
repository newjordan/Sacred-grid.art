import React from 'react';

const RangeSlider = ({ 
    label, 
    min, 
    max, 
    value, 
    onChange, 
    step = 1, 
    disabled = false 
}) => (
    <div>
        <label>{label}: </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            disabled={disabled}
        />
        <span>{value}</span>
    </div>
);

export default RangeSlider;