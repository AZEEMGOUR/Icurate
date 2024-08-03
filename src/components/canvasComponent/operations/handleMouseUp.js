const handleMouseUp = (isDrawing, newShape, setShapes, setNewShape, setIsDrawing) => {
    if (isDrawing) {
        setShapes(prevShapes => [
            ...prevShapes,
            {
                ...newShape,
                visible: true, // Ensure new shapes are visible by default
            }
        ]);
        setNewShape(null);
        setIsDrawing(false);
    }
};

export default handleMouseUp;
