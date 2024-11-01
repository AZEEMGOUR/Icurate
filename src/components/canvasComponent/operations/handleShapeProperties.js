// operations/shapePropertiesOperation.js

export const getShapeProperties = (shape) => {
    if (!shape) return {};
  
    const { x, y, width, height, layerId, datatypeId } = shape;
    const layerName = shape.layerName || 'Unknown Layer';
    const datatypeName = shape.datatypeName || 'Unknown Datatype';

  
    return {
      layerName,
      datatypeName,
      x: shape.x,
      y:shape.y,
      width: shape.width,
      height:shape.height
    };
  };
  