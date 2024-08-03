const copySelectedShapes = (shapes, selectedShapes, setShapes, setSelectedShapes) => {
    const copiedShapes = selectedShapes.map(shape => ({
      ...shape,
      id: `${shape.id}-copy-${Date.now()}-${Math.random()}`, // Ensure each copied shape has a unique ID
      x: shape.x + 20, // Offset the copied shape for visibility
      y: shape.y + 20
    }));
  
    setShapes([...shapes, ...copiedShapes]);
    setSelectedShapes(copiedShapes); // Select the newly copied shapes
  };
  
  export default copySelectedShapes;
  