const handleMouseUp = (isDrawing, newShape, setShapes, setNewShape, setIsDrawing, isAllLocked) => {
    console.log("handleMouseUp triggered");

    if (isDrawing && newShape) {
        console.log("Adding new shape:", newShape);
        setShapes(prevShapes => [
            ...prevShapes,
            {
                ...newShape,
                visible: true,
            }
        ]);
        setNewShape(null);
        setIsDrawing(false);
    } else if (newShape && newShape.id) {
        console.log("Updating existing shape:", newShape);
        setShapes(prevShapes => prevShapes.map(shape =>
            shape.id === newShape.id ? { ...shape, ...newShape } : shape
        ));
        setNewShape(null);
    } else {
        console.warn("newShape is null or does not have an id during handleMouseUp");
        setIsDrawing(false);
    }
};

export default handleMouseUp;
