import React, { useState } from 'react';

const CollapsibleSection = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    
    const toggleSection = () => {
        setIsOpen(!isOpen);
    };
    
    return (
        <div style={{ marginBottom: '16px' }}>
            <div
                onClick={toggleSection}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    transition: 'all 0.2s ease',
                    marginBottom: isOpen ? '8px' : '0'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
            >
                <h3 style={{
                    margin: '0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.9)'
                }}>{title}</h3>
                <span style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    transition: 'transform 0.2s ease',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                }}>{isOpen ? '▼' : '►'}</span>
            </div>
            {isOpen && (
                <div style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    borderTop: 'none',
                    borderTopLeftRadius: '0',
                    borderTopRightRadius: '0'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;