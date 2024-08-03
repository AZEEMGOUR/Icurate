import React, { useState } from 'react';
import './popup.css';  // Adjust the path if necessary

const DesignNamePopup = ({ group, onSave, onCancel }) => {
  const [designName, setDesignName] = useState('');

  const handleSave = () => {
    if (group) {
      const groupShapes = group.getChildren().map(shape => ({
        id: shape.id(),
        x: shape.x(),
        y: shape.y(),
        width: shape.width(),
        height: shape.height(),
        fill: shape.fill(),
      }));

      console.log('Group shapes to save:', groupShapes);
      alert('Group shapes to save: ' + JSON.stringify(groupShapes, null, 2));

      const groupData = {
        name: designName,
        shapes: groupShapes,
      };

      const jsonStr = JSON.stringify(groupData, null, 2);
      console.log('JSON string to save:', jsonStr);
      alert('JSON string to save: ' + jsonStr);

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${designName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    onSave(designName);
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <h3>Enter Design Name</h3>
        <input
          type="text"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default DesignNamePopup;
