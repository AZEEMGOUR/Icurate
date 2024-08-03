const handleMouseMove = (e, isDrawing, newShape, setNewShape, isDraggingMode, selectedShapes, stageRef) => {
    if (isDrawing) {
        // Drawing mode logic
        const stage = e.target.getStage();
        const pointerPosition = stage.getRelativePointerPosition();
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;

        const updatedShape = {
            ...newShape,
            width: adjustedX - newShape.x,
            height: adjustedY - newShape.y,
        };
        setNewShape(updatedShape);
    } else if (isDraggingMode) {
        // Dragging mode logic
        const stage = stageRef.current;
        const pointerPosition = stage.getPointerPosition();

        selectedShapes.forEach((shape) => {
            const node = stage.findOne(`#${shape.id}`);
            if (node) {
                node.position({
                    x: pointerPosition.x - node.width() / 2,
                    y: pointerPosition.y - node.height() / 2,
                });
            }
        });

        stage.getLayers().forEach(layer => layer.batchDraw());
    }
};

export default handleMouseMove;
