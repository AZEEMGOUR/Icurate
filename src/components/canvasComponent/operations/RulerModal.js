import React, { useState } from 'react';
import './RulerModal.css';

const RulerModal = ({ isOpen, onClose, scaleType, setScaleType, unit, setUnit }) => {
    const [scaleMode, setScaleMode] = useState('simple');  // 'simple' or 'complex'

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Ruler Settings</h2>
                <div className="modal-section">
                    <button
                        className={`mode-button ${scaleMode === 'simple' ? 'active' : ''}`}
                        onClick={() => setScaleMode('simple')}
                    >
                        Simple Scale
                    </button>
                    <button
                        className={`mode-button ${scaleMode === 'complex' ? 'active' : ''}`}
                        onClick={() => setScaleMode('complex')}
                    >
                        Complex Scale
                    </button>
                </div>

                <div className="modal-section">
                    <label htmlFor="scaleType">Type:</label>
                    <select
                        id="scaleType"
                        value={scaleType}
                        onChange={(e) => setScaleType(e.target.value)}
                    >
                        {scaleMode === 'simple' ? (
                            <>
                                <option value="any">Any Angle</option>
                                <option value="horizontal">Horizontal</option>
                                <option value="vertical">Vertical</option>
                                <option value="diagonal">Diagonal</option>
                            </>
                        ) : (
                            <>
                                <option value="orthogonal">Orthogonal</option>
                            </>
                        )}
                    </select>
                </div>
                <div className="modal-section">
                    <label htmlFor="unit">Measurement Unit:</label>
                    <select
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}  // Ensure setUnit is called correctly
                    >
                        <option value="px">Pixels (px)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="inch">Inches (inch)</option>
                    </select>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default RulerModal;
