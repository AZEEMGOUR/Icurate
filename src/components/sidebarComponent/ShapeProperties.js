import React, { useEffect } from 'react';
import './ShapeProperties.css';

const ShapeProperties = ({ selectedShapes }) => {
  useEffect(() => {
    // Trigger any required side-effects on shape selection change
  }, [selectedShapes]);

  if (!selectedShapes || selectedShapes.length === 0) {
    return <div className="shape-properties-empty">No shape selected</div>;
  }

  // Handle multiple selections
  const isMultiple = selectedShapes.length > 1;

  const commonProperties = {
    type: isMultiple ? "Multiple" : selectedShapes[0].type,
    layer_name: isMultiple ? "Multiple" : selectedShapes[0].layer_name,
    layerId: isMultiple ? "Multiple" : selectedShapes[0].layerId,
    datatype_name: isMultiple ? "Multiple" : selectedShapes[0].datatype_name,
    x: isMultiple ? "Multiple" : selectedShapes[0].x,
    y: isMultiple ? "Multiple" : selectedShapes[0].y,
    width: isMultiple ? "Multiple" : selectedShapes[0].width,
    height: isMultiple ? "Multiple" : selectedShapes[0].height,
  };

  return (
    <div className="shape-properties-container">
      <h3 className="shape-properties-header">Shape Properties</h3>
      <div className="shape-property">
        <label>Type:</label>
        <span>{commonProperties.type || 'N/A'}</span>
      </div>
      <div className="shape-property">
        <label>Layer Name:</label>
        <span>{commonProperties.layer_name || 'N/A'}</span>
      </div>
      <div className="shape-property">
        <label>Layer Number:</label>
        <span>{commonProperties.layerId !== undefined ? commonProperties.layerId : 'N/A'}</span>
      </div>
      <div className="shape-property">
        <label>Datatype Name:</label>
        <span>{commonProperties.datatype_name || 'N/A'}</span>
      </div>
      <div className="shape-property">
        <label>x-coordinate:</label>
        <span>{commonProperties.x !== undefined ? commonProperties.x : 'N/A'}</span>
      </div>
      <div className="shape-property">
        <label>y-coordinate:</label>
        <span>{commonProperties.y !== undefined ? commonProperties.y : 'N/A'}</span>
      </div>
      <div className="shape-property">
        <label>Width:</label>
        <span>{commonProperties.width !== undefined ? commonProperties.width : 'N/A'}</span>
      </div>
      <div className="shape-property">
        <label>Height:</label>
        <span>{commonProperties.height !== undefined ? commonProperties.height : 'N/A'}</span>
      </div>
    </div>
  );
};

export default ShapeProperties;
