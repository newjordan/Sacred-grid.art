import React from 'react';

const ColorPicker = ({ label, value, onChange }) => (
    <div>
        <label>{label}: </label>
        <input
            type="color"
            value={value}
            onChange={onChange}
        />
        <span>{value}</span>
    </div>
);

export default ColorPicker;