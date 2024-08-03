import React, { useState } from 'react';

const SaveGroupedShapesForm = ({ groupedShapes }) => {
  const [designName, setDesignName] = useState('');

  const handleSave = () => {
    const formattedShapes = groupedShapes.map(shape => ({
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      color: shape.color,
      boundaryColor: shape.boundaryColor,
      pattern: shape.pattern,
      opacity: shape.opacity,
      layerId: shape.layerId,
      visible: shape.visible,
    }));
    
    const dataStr = JSON.stringify(formattedShapes, null, 2);
    const fileName = `${designName}.json`;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <div className="save-grouped-shapes-form">
      <input
        type="text"
        placeholder="Enter Design Name"
        value={designName}
        onChange={(e) => setDesignName(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default SaveGroupedShapesForm;
