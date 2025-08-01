// src/components/SettingsChecklist.js - Visual Settings Validation Checklist
// Shows real-time validation of settings export completeness

import React, { useState, useEffect } from 'react';

const SettingsChecklist = ({ validationReport, isVisible, onClose }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (validationReport && validationReport.groups) {
      // Auto-expand groups with issues
      const newExpanded = {};
      validationReport.groups.forEach(group => {
        if (group.percentage < 100) {
          newExpanded[group.group] = true;
        }
      });
      setExpandedGroups(newExpanded);
    }
  }, [validationReport]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  if (!isVisible || !validationReport) return null;

  const getStatusIcon = (percentage) => {
    if (percentage === 100) return '✅';
    if (percentage >= 90) return '⚠️';
    return '❌';
  };

  const getStatusColor = (percentage) => {
    if (percentage === 100) return '#00ff88';
    if (percentage >= 90) return '#ffaa00';
    return '#ff4444';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '16px'
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              color: getStatusColor(validationReport.overall.percentage) 
            }}>
              📊 Settings Export Validation
            </h2>
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '14px', 
              color: 'rgba(255, 255, 255, 0.7)' 
            }}>
              Comprehensive check of all exported settings
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Overall Status */}
        <div style={{
          background: `rgba(${validationReport.overall.percentage === 100 ? '0, 255, 136' : validationReport.overall.percentage >= 90 ? '255, 170, 0' : '255, 68, 68'}, 0.1)`,
          border: `1px solid rgba(${validationReport.overall.percentage === 100 ? '0, 255, 136' : validationReport.overall.percentage >= 90 ? '255, 170, 0' : '255, 68, 68'}, 0.3)`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>
            {getStatusIcon(validationReport.overall.percentage)}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {validationReport.overall.percentage}%
          </div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            {validationReport.overall.passed}/{validationReport.overall.total} Settings Captured
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: getStatusColor(validationReport.overall.percentage)
          }}>
            Status: {validationReport.overall.status}
          </div>
        </div>

        {/* Groups Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            marginBottom: '16px',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            📋 Settings Groups
          </h3>
          
          {validationReport.groups.map((group, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              marginBottom: '8px',
              overflow: 'hidden'
            }}>
              <div
                onClick={() => toggleGroup(group.group)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: expandedGroups[group.group] ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {getStatusIcon(group.percentage)}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>
                    {group.group}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontSize: '14px',
                    color: getStatusColor(group.percentage),
                    fontWeight: 'bold'
                  }}>
                    {group.passed}/{group.total} ({group.percentage}%)
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    {expandedGroups[group.group] ? '▼' : '▶'}
                  </span>
                </div>
              </div>
              
              {expandedGroups[group.group] && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Detailed validation results for {group.group} would appear here.
                    This includes individual setting checks and any missing values.
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Missing Settings */}
        {validationReport.missing && validationReport.missing.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              color: '#ff4444'
            }}>
              ❌ Missing Settings ({validationReport.missing.length})
            </h3>
            
            <div style={{
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid rgba(255, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {validationReport.missing.map((missing, index) => (
                <div key={index} style={{
                  padding: '8px 0',
                  borderBottom: index < validationReport.missing.length - 1 ? '1px solid rgba(255, 68, 68, 0.2)' : 'none',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {missing.name}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                    Current: {JSON.stringify(missing.current)} → Exported: {JSON.stringify(missing.exported)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {validationReport.recommendations && validationReport.recommendations.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              color: '#ffaa00'
            }}>
              💡 Recommendations
            </h3>
            
            <div style={{
              background: 'rgba(255, 170, 0, 0.1)',
              border: '1px solid rgba(255, 170, 0, 0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              {validationReport.recommendations.map((rec, index) => (
                <div key={index} style={{
                  padding: '4px 0',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => {
              console.log('📊 Full Validation Report:', validationReport);
            }}
            style={{
              background: 'rgba(0, 119, 255, 0.2)',
              border: '1px solid rgba(0, 119, 255, 0.4)',
              borderRadius: '8px',
              color: 'white',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📋 Log Full Report
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0, 255, 136, 0.2)',
              border: '1px solid rgba(0, 255, 136, 0.4)',
              borderRadius: '8px',
              color: 'white',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✅ Continue Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsChecklist;
