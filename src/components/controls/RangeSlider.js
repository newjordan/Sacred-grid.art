import React, { useState } from 'react';

const RangeSlider = ({ 
    label, 
    min, 
    max, 
    value, 
    onChange, 
    step = 1, 
    disabled = false 
}) => {
    const [inputValue, setInputValue] = useState(value);
    
    // Handle slider change
    const handleSliderChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(e);
    };
    
    // Handle text input change
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
    };
    
    // Handle text input blur (when user finishes editing)
    const handleInputBlur = () => {
        let validValue = parseFloat(inputValue);
        
        // Validate the input value
        if (isNaN(validValue)) {
            validValue = value; // Reset to current value if invalid
        } else {
            // Clamp value between min and max
            validValue = Math.min(Math.max(validValue, min), max);
        }
        
        // Update input display
        setInputValue(validValue);
        
        // Only trigger onChange if the value actually changed
        if (validValue !== value) {
            // Create a synthetic event object similar to what input[type="range"] would produce
            const syntheticEvent = {
                target: {
                    value: validValue
                }
            };
            onChange(syntheticEvent);
        }
    };
    
    // Handle key press events (Enter key)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Trigger the blur event
        }
    };

    return (
        <div className="range-slider-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ minWidth: '130px', marginRight: '10px' }}>{label}: </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleSliderChange}
                disabled={disabled}
                style={{ flex: 1 }}
            />
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                disabled={disabled}
                style={{ 
                    width: '60px', 
                    marginLeft: '10px', 
                    padding: '2px 5px',
                    textAlign: 'right',
                    border: '1px solid #ccc',
                    borderRadius: '3px'
                }}
            />
        </div>
    );
};

export default RangeSlider;