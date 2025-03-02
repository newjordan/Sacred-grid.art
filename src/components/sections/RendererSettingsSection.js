import React from 'react';
import FieldSet from '../controls/FieldSet';
import { RendererType } from '../../renderers/RendererFactory';

const RendererSettingsSection = () => {
    return (
        <FieldSet legend="Renderer Information">
            <div style={{ padding: '10px' }}>
                <p>This is the Canvas2D version of Sacred Grid.</p>
                <p>It uses HTML5 Canvas for all rendering, making it highly compatible with all devices and browsers.</p>
            </div>
        </FieldSet>
    );
};

export default RendererSettingsSection;