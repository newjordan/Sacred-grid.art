import React from 'react';

const ToggleSwitch = ({ label, value, onChange }) => {
    const handleChange = (e) => {
        onChange(e.target.value === 'true');
    };
    
    return (
        <div>
            <label>{label}: </label>
            <select
                value={value ? 'true' : 'false'}
                onChange={handleChange}
                style={{ background: 'rgba(40, 40, 40, 0.7)', color: 'white', border: '1px solid #444' }}
            >
                <option value="false">No</option>
                <option value="true">Yes</option>
            </select>
            <span>{value ? 'Yes' : 'No'}</span>
        </div>
    );
};

export default ToggleSwitch;