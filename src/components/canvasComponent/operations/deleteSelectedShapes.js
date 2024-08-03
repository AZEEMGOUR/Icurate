const deleteSelectedShapes = (shapes, selectedShapes, setShapes, setSelectedShapes) => {
  const remainingShapes = shapes.filter(shape => !selectedShapes.includes(shape));
  setShapes(remainingShapes);
  setSelectedShapes([]);
  console.log("Shapes after deletion:", remainingShapes);
};

export default deleteSelectedShapes;
