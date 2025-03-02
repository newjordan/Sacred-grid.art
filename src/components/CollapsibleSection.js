import React, { useState } from 'react';

const CollapsibleSection = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    
    const toggleSection = () => {
        setIsOpen(!isOpen);
    };
    
    return (
        <div style={{ marginBottom: '15px' }}>
            <div 
                onClick={toggleSection} 
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px',
                    backgroundColor: 'rgba(30, 30, 30, 0.6)',
                    borderRadius: '4px'
                }}
            >
                <h3 style={{ margin: '5px 0' }}>{title}</h3>
                <span>{isOpen ? '▼' : '►'}</span>
            </div>
            {isOpen && (
                <div style={{ padding: '10px', backgroundColor: 'rgba(20, 20, 20, 0.4)', borderRadius: '0 0 4px 4px' }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;