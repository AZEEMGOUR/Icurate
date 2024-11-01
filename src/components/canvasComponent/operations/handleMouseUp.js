import { saveState as saveUndoState } from './undo';

const handleMouseUp = (
    isDrawing, 
    newShape, 
    setShapes, 
    setNewShape, 
    setIsDrawing, 
    isAllLocked, 
    isRulerActive, 
    startPoint, 
    endPoint, 
    deactivateRuler, 
    calculateDistance, 
    setLine, 
    unit, 
    scaleType, 
    setStartPoint, 
    setEndPoint, 
    setLineFinalized, 
    setDistance,
    selectionRect, // Added for selection rectangle
    setSelectionRect, // Added to clear the selection rectangle
    setIsSelecting, // Added to handle the selection mode
    shapes, // Added to get shapes
    setSelectedShapes, isDraggingMode, setIsDraggingMode, isCutting, cutRect
) => {
    // Handle selection rectangle finalization
    if (selectionRect && startPoint && !isRulerActive && !isDraggingMode) {
        const selected = shapes.filter(shape => {
            return shape.x >= selectionRect.x &&
                shape.x + shape.width <= selectionRect.x + selectionRect.width &&
                shape.y >= selectionRect.y &&
                shape.y + shape.height <= selectionRect.y + selectionRect.height;
        });
    
        setSelectedShapes(selected);
        setSelectionRect(null);  // Clear the selection rectangle
        setIsSelecting(false);   // End selection mode
    }
    
    if (isCutting && cutRect) {
        const updatedShapes = shapes.map(shape => {
          if (shapeIntersectsWithCut(shape, cutRect)) {
            return cutShape(shape, cutRect); // Implement the logic for cutting the shape
          }
          return shape;
        });
      
        setShapes(updatedShapes); // Update shapes after cutting
        setCutRect(null); // Clear the cut rectangle
      }
      
      

    // Handle ruler mode
    if (isRulerActive && startPoint && endPoint) {
        const distance = calculateDistance(startPoint, endPoint, scaleType, unit);
        setDistance(distance);

        const newLine = {
            id: Date.now(),
            start: startPoint,
            end: endPoint,
            distance: `${distance} ${unit}`,
            unit: unit,
            color: 'red',
        };

        setShapes(prevShapes => [...prevShapes, newLine]);
        setLine(null);
        setIsDrawing(false);
        setStartPoint(null);
        setEndPoint(null);
        setLineFinalized(true);
    }
    
    if (isDraggingMode) {
        setShapes(prevShapes => {
          return prevShapes.map(shape => {
            if (shape.type === 'Group') {
              const shapeOffset = shapeOffsets.find(offset => offset.id === shape.id);
              if (shapeOffset) {
                return { ...shape, x: shape.x + dx, y: shape.y + dy };
              }
            }
            return shape;
          });
        });
        setIsDraggingMode(false);
      }
      

    // Handle drawing shapes
    if (isDrawing && newShape) {
        setShapes(prevShapes => {
            saveUndoState(prevShapes);
            return [
                ...prevShapes,
                {
                    ...newShape,
                    visible: true,
                }
            ];
        });
        setNewShape(null);
        setIsDrawing(false);
    } else if (newShape && newShape.id) {
        setShapes(prevShapes => {
            saveUndoState(prevShapes); // Save state for undo when updating a shape
            return prevShapes.map(shape =>
                shape.id === newShape.id ? { ...shape, ...newShape } : shape
            );
        });
        setNewShape(null);
    } else {
        setIsDrawing(false);
    }
};

export default handleMouseUp;
