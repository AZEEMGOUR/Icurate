import React, { useState } from 'react';
import './LabelSettings.css';  // Import the updated CSS file for styling

const LabelSettings = ({ selectedLabel, onUpdateLabel, onClose }) => {
  const [fontFamily, setFontFamily] = useState(selectedLabel?.fontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(selectedLabel?.fontSize || 16);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [rotation, setRotation] = useState(0);  // Using fixed rotation options

  const handleUpdate = () => {
    const updatedLabel = {
      fontFamily,
      fontSize,
      fontStyle: `${isBold ? 'bold' : ''} ${isItalic ? 'italic' : ''}`,
      textAlign,
      rotation,
    };
    onUpdateLabel(updatedLabel);
    onClose();  // Close the modal after applying settings
  };

  return (
    <div className="label-settings-modal">
      <div className="label-settings-popup">
        <h3>Label Settings</h3>

        {/* Font Family and Font Size in one row */}
        <div className="row">
          <div className="col">
            <label>Font Family:</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>

          <div className="col">
            <label>Font Size:</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Bold and Italic in one row */}
        <div className="row">
          <div className="col">
            <label>Bold:</label>
            <input
              type="checkbox"
              checked={isBold}
              onChange={(e) => setIsBold(e.target.checked)}
            />
          </div>

          <div className="col">
            <label>Italic:</label>
            <input
              type="checkbox"
              checked={isItalic}
              onChange={(e) => setIsItalic(e.target.checked)}
            />
          </div>
        </div>

        {/* Text Align and Rotation in one row */}
        <div className="row">
          <div className="col">
            <label>Text Align:</label>
            <select value={textAlign} onChange={(e) => setTextAlign(e.target.value)}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div className="col">
            <label>Rotation:</label>
            <select value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))}>
              <option value="0">0°</option>
              <option value="90">90°</option>
              <option value="180">180°</option>
              <option value="360">360°</option>
            </select>
          </div>
        </div>

        <div className="label-settings-buttons">
          <button onClick={handleUpdate}>Apply</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default LabelSettings;
