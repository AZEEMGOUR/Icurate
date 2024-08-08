const handleMouseMove = (e, isDrawing, newShape, setNewShape, isDraggingMode, selectedShapes, stageRef, lockedLayers, isAllLocked) => {
    console.log("handleMouseMove triggered");

    if (isDrawing) {
        console.log("Updating new shape while drawing");

        const stage = e.target.getStage();
        const pointerPosition = stage.getRelativePointerPosition();
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;

        const updatedShape = {
            ...newShape,
            width: adjustedX - newShape.x,
            height: adjustedY - newShape.y,
        };
        console.log("Updated shape:", updatedShape);
        setNewShape(updatedShape);
    } else if (isDraggingMode) {
        console.log("Dragging mode active");

        if (isAllLocked) {
            console.log("Global lock is active. Dragging is disabled.");
            return; // Prevent dragging if the global lock is active
        }

        const isAnyShapeLocked = selectedShapes.some(shape => lockedLayers[`${shape.layerId}-${shape.datatypeId}`]);

        if (isAnyShapeLocked) {
            console.log("One or more selected shapes are locked. Dragging is disabled.");
            return; // Exit early if any selected shape is locked, preventing dragging
        }

        const stage = stageRef.current;
        const pointerPosition = stage.getRelativePointerPosition();

        const updatedShapes = selectedShapes.map(shape => ({
            ...shape,
            x: pointerPosition.x - shape.width / 2,
            y: pointerPosition.y - shape.height / 2,
        }));

        setNewShape(updatedShapes);
    }
};

export default handleMouseMove;
