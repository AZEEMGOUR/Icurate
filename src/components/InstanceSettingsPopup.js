import React, { useState, useEffect } from 'react';
import './InstanceSettingsPopup.css';

const InstanceSettingsPopup = ({ selectedInstance, isVisible, onClose }) => {
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [textSize, setTextSize] = useState(12);
  const [font, setFont] = useState('Arial');
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  useEffect(() => {
    if (selectedInstance) {
      setStrokeWidth(selectedInstance.strokeWidth || 1);
      setTextSize(selectedInstance.textSize || 12);
      setFont(selectedInstance.font || 'Arial');
      setPositionX(selectedInstance.x || 0);
      setPositionY(selectedInstance.y || 0);
    }
  }, [selectedInstance]);

  if (!isVisible) return null;

  return (
    <div className="popup-container">
      <div className="popup-content">
        <h2>Instance Settings</h2>

        {/* First Row: Stroke Width and Text Size */}
        <div className="form-group-row">
          <div className="form-group">
            <label>Stroke Width</label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Text Size</label>
            <input
              type="number"
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
            />
          </div>
        </div>

        {/* Second Row: Font and Position X */}
        <div className="form-group-row">
          <div className="form-group">
            <label>Font</label>
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
          <div className="form-group">
            <label>Position X</label>
            <input
              type="number"
              value={positionX}
              onChange={(e) => setPositionX(e.target.value)}
            />
          </div>
        </div>

        {/* Third Row: Position Y */}
        <div className="form-group">
          <label>Position Y</label>
          <input
            type="number"
            value={positionY}
            onChange={(e) => setPositionY(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={() => console.log('Apply changes')}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default InstanceSettingsPopup;
