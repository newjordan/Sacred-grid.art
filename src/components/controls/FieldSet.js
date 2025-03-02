import React from 'react';

const FieldSet = ({ legend, children, style = {} }) => (
    <fieldset 
        style={{ 
            border: '1px solid rgba(100, 100, 100, 0.3)', 
            padding: '10px', 
            marginBottom: '1em',
            ...style
        }}
    >
        <legend>{legend}</legend>
        {children}
    </fieldset>
);

export default FieldSet;