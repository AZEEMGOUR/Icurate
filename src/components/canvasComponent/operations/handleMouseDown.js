import { v4 as uuidv4 } from 'uuid';

const handleMouseDown = (e, setIsDrawing, setNewShape, selectedLayer, setSelectedShapes, shapes, selectedShapes, rectangleToolActive, transformerRef) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getRelativePointerPosition();
    const adjustedX = pointerPosition.x - stage.width() / 2;
    const adjustedY = pointerPosition.y - stage.height() / 2;
    // Check if the click was on a transformer handle
    if (e.target.getParent() && e.target.getParent().className === 'Transformer') {
        return; // Don't change selection if interacting with resize/rotate handles
    }

    if (rectangleToolActive) {
        // Start drawing a new shape
        setIsDrawing(true);
        setNewShape({
            id: uuidv4(),  // Assign a unique ID to the shape
            x: adjustedX,
            y: adjustedY,
            width: 0,
            height: 0,
            color: selectedLayer?.color || '#000',
            boundaryColor: selectedLayer?.boundaryColor || '#000',
            pattern: selectedLayer?.pattern.type || 'solid',
            opacity: selectedLayer?.pattern.opacity || 1,
            layerId: selectedLayer?.layer_number || 0,
        });
    } else {
        // Reverse shapes array to prioritize the top-most shape
        const clickedShape = [...shapes].reverse().find(shape =>
            adjustedX > shape.x && adjustedX < shape.x + shape.width &&
            adjustedY > shape.y && adjustedY < shape.y + shape.height
        );

        if (clickedShape) {
            let updatedSelection;

            if (e.evt.ctrlKey || e.evt.metaKey) {
                // Handle multiple selection
                if (selectedShapes.includes(clickedShape)) {
                    updatedSelection = selectedShapes.filter(shape => shape !== clickedShape);
                } else {
                    updatedSelection = [...selectedShapes, clickedShape];
                }
            } else {
                // Handle single selection
                updatedSelection = [clickedShape];
            }

            setSelectedShapes(updatedSelection);

            // Update the transformer with the selected shapes
            const konvaNodes = updatedSelection.map(shape => stage.findOne(node => node._id === shape._id));
            if (transformerRef && transformerRef.current) {
                transformerRef.current.nodes(konvaNodes.filter(node => node)); // Ensure all nodes exist
                transformerRef.current.getLayer().batchDraw();
            }
        } else {
            // Clear selection if no shape is clicked
            setSelectedShapes([]);
            if (transformerRef && transformerRef.current) {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }
};

export default handleMouseDown;
