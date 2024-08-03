// operations/drawShapesWithVisibility.js
const drawShapesWithVisibility = (shapes, setShapes, layerVisibility) => {
    const updatedShapes = shapes.map(shape => ({
        ...shape,
        visible: layerVisibility[`${shape.layerId}-${shape.datatypeId}`] !== false,
    }));
    setShapes(updatedShapes);
};

export default drawShapesWithVisibility;
