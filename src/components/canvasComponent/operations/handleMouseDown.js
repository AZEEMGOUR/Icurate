import { v4 as uuidv4 } from 'uuid';

const handleMouseDown = (e, setIsDrawing, setNewShape, selectedLayer, setSelectedShapes, shapes, selectedShapes, rectangleToolActive, transformerRef, lockedLayers, isAllLocked) => {
    console.log("handleMouseDown triggered");

    const stage = e.target.getStage();
    const pointerPosition = stage.getRelativePointerPosition();
    const adjustedX = pointerPosition.x - stage.width() / 2;
    const adjustedY = pointerPosition.y - stage.height() / 2;

    if (e.target.getParent() && e.target.getParent().className === 'Transformer') {
        return; // Don't change selection if interacting with resize/rotate handles
    }

    if (rectangleToolActive) {
        console.log("Starting new shape");
        setIsDrawing(true);
        const newShape = {
            id: uuidv4(),
            x: adjustedX,
            y: adjustedY,
            width: 0,
            height: 0,
            color: selectedLayer?.color || '#000',
            boundaryColor: selectedLayer?.boundaryColor || '#000',
            pattern: selectedLayer?.pattern.type || 'solid',
            opacity: selectedLayer?.pattern.opacity || 1,
            layerId: selectedLayer?.layer_number || 0,
            datatypeId: selectedLayer?.datatype_number || 0,
        };
        console.log("New shape initialized:", newShape);
        setNewShape(newShape);
    } else {
        if (isAllLocked) {
            console.log("Global lock is active. Shape selection is disabled.");
            return;  // Prevent selection if the global lock is active
        }

        const clickedShape = [...shapes].reverse().find(shape =>
            adjustedX > shape.x && adjustedX < shape.x + shape.width &&
            adjustedY > shape.y && adjustedY < shape.y + shape.height
        );

        if (clickedShape) {
            const key = `${clickedShape.layerId}-${clickedShape.datatypeId}`;
            if (lockedLayers[key]) {
                console.log("Shape is locked and cannot be selected:", clickedShape);
                return;  // Prevent selection if the shape is in a locked layer
            }

            console.log("Shape selected:", clickedShape);

            let updatedSelection;

            if (e.evt.ctrlKey || e.evt.metaKey) {
                if (selectedShapes.includes(clickedShape)) {
                    updatedSelection = selectedShapes.filter(shape => shape !== clickedShape);
                } else {
                    updatedSelection = [...selectedShapes, clickedShape];
                }
            } else {
                updatedSelection = [clickedShape];
            }

            setSelectedShapes(updatedSelection);

            const konvaNodes = updatedSelection.map(shape => stage.findOne(node => node._id === shape._id));
            if (transformerRef && transformerRef.current) {
                transformerRef.current.nodes(konvaNodes.filter(node => node));
                transformerRef.current.getLayer().batchDraw();
            }
        } else {
            setSelectedShapes([]);
            if (transformerRef && transformerRef.current) {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }
};

export default handleMouseDown;
