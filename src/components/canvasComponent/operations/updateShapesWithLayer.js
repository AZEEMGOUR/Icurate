const updateShapesWithLayer = (shapes, setShapes, updatedLayer) => {
    const updatedShapes = shapes.map(shape => {
        if (shape.layerId === updatedLayer.layer_number) {
            return {
                ...shape,
                color: updatedLayer.color,
                boundaryColor: updatedLayer.boundaryColor,
                pattern: {
                    ...shape.pattern,
                    opacity: updatedLayer.pattern.opacity
                }
            };
        }
        return shape;
    });
    setShapes(updatedShapes);
};

export default updateShapesWithLayer;
