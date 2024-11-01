// handleMultiSelect.js

export const handleMultiSelectMouseDown = (
    e, setStartPoint, setSelectionRect, setIsSelecting
) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    setStartPoint({
        x: pointerPosition.x,
        y: pointerPosition.y
    });

    setSelectionRect({
        x: pointerPosition.x,
        y: pointerPosition.y,
        width: 0,
        height: 0,
        visible: true,
        fill: 'rgba(0,0,255,0.2)',
        stroke: 'blue',
        strokeWidth: 1
    });

    setIsSelecting(true);
};

export const handleMultiSelectMouseMove = (
    e, startPoint, selectionRect, setSelectionRect
) => {
    if (selectionRect && startPoint) {
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();

        setSelectionRect(prevRect => ({
            ...prevRect,
            width: pointerPosition.x - startPoint.x,
            height: pointerPosition.y - startPoint.y
        }));
    }
};

export const handleMultiSelectMouseUp = (
    selectionRect, setSelectionRect, setIsSelecting, shapes, setSelectedShapes
) => {
    if (selectionRect) {
        const selected = shapes.filter(shape => {
            return shape.x >= selectionRect.x &&
                shape.x + shape.width <= selectionRect.x + selectionRect.width &&
                shape.y >= selectionRect.y &&
                shape.y + shape.height <= selectionRect.y + selectionRect.height;
        });

        setSelectedShapes(selected);
        setSelectionRect(null);
        setIsSelecting(false);
    }
};
