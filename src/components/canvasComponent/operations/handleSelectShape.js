const handleSelectShape = (shape, selectedShapes, setSelectedShapes) => {
    setSelectedShapes([shape.id]);  // Only select the clicked shape, deselect others
};

export default handleSelectShape;
