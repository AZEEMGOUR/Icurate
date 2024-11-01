import { v4 as uuidv4 } from 'uuid';
import { saveState as saveUndoState } from './undo';
import { handleRulerMouseDown } from './ruler';

const handleMouseDown = (
    e, 
    setIsDrawing, 
    setNewShape, 
    selectedLayer, 
    setSelectedShapes, 
    shapes, 
    selectedShapes, 
    rectangleToolActive, 
    transformerRef, 
    lockedLayers, 
    isAllLocked, 
    isRulerActive, 
    setStartPoint, 
    startPoint, 
    setEndPoint, 
    setLineFinalized, 
    lineFinalized, 
    scaleType, 
    unit, 
    onShapeSelect, 
    setSelectionRect, 
    setIsSelecting , isDraggingMode, isCutting, setCutStartPoint, setCutRect, cutRect, cutShapeWithClip, setShapes
) => {
    // If no tool is active and not in ruler mode, initiate selection rectangle
    
    const stage = e.target.getStage();
    if (isAllLocked) {
        return;
    }
    

    const shapeIntersectsWithCut = (shape, cutRect) => {
        // Check if the shape and the cutting rectangle overlap
        return (
          shape.x < cutRect.x + cutRect.width &&
          shape.x + shape.width > cutRect.x &&
          shape.y < cutRect.y + cutRect.height &&
          shape.y + shape.height > cutRect.y
        );
      };
      
    if (isCutting && cutRect) {
        const updatedShapes = shapes.map(shape => {
          if (shapeIntersectsWithCut(shape, cutRect)) {
            return cutShapeWithClip(shape, cutRect); // Apply clipping using cutRect
          }
          return shape;

        });
        
        setShapes(updatedShapes); // Update shapes with clipping
        setCutRect(null); // Clear the cut rectangle
      }
      
      
      

    if (!rectangleToolActive && !isRulerActive && !isCutting && e.target === stage) {
        const stage = e.target.getStage();
        const pointerPosition = stage.getRelativePointerPosition();
        
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;
        
        // Store the initial coordinates as an array [x, y]
        setStartPoint({ x: adjustedX, y: adjustedY });
        setSelectionRect({ x: adjustedX, y: adjustedY, width: 0, height: 0 });
        setIsSelecting(true);  // Start selection mode
    }
    

    
    //saveUndoState(shapes); 
    
    // Handle ruler mode
    if (isRulerActive) {
        const stage = e.target.getStage();
        const pointerPosition = stage.getRelativePointerPosition();
        const scale = stage.scaleX();

        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;
        

        if (!startPoint || lineFinalized) {
            setStartPoint({ x: adjustedX, y: adjustedY });
            setEndPoint(null); 
            setLineFinalized(false); 
            setIsDrawing(true); 
        }
        return;
    }

    // Handle normal shape interaction
    
    const pointerPosition = stage.getRelativePointerPosition();
    const adjustedX = pointerPosition.x - stage.width() / 2;
    const adjustedY = pointerPosition.y - stage.height() / 2;

    if (e.target.getParent() && e.target.getParent().className === 'Transformer') {
        return; 
    }

    if (rectangleToolActive) {
        console.log("Starting new shape");
        setIsDrawing(true);
        const newShape = {
            id: `shape_${uuidv4()}`,
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
            type: 'Rectangle',
            visible: true
        };
        console.log(newShape.x, newShape.y, newShape.height, newShape.width);
        setNewShape(newShape);
        // saveUndoState(shapes); 
        return;
    } 
    if (!rectangleToolActive && !isRulerActive) {
        if (e.target === stage && !e.evt.ctrlKey) {
    // Deselect all only if Ctrl is NOT pressed
    setSelectedShapes([]);
    if (transformerRef.current) {
        transformerRef.current.nodes([]);  // Clear transformer selection
        transformerRef.current.getLayer().batchDraw();
    }
    return;
}

const pointerPosition = stage.getRelativePointerPosition();
        const clickedShape = shapes.find(shape => shape.id === e.target.id);

        if (clickedShape) {
            const isLayerLocked = lockedLayers[`${clickedShape.layerId}-${clickedShape.datatypeId}`];
            console.log("mousedown clicked shape lock or not confirmation ", isLayerLocked, lockedLayers[`${clickedShape.layerId}-${clickedShape.datatypeId}`])
            if (isLayerLocked) {
                return;
            }
            if (e.evt.ctrlKey || e.evt.metaKey) {
                // If Ctrl or Meta (Cmd on macOS) is pressed, allow multiple selection
                setSelectedShapes(prevSelectedShapes => {
                    const isSelected = prevSelectedShapes.some(shape => shape.id === clickedShape.id);
        
                    console.log('Current selected shapes:', prevSelectedShapes);
                    console.log('Clicked shape:', clickedShape);
                    
                    if (isSelected) {
                        console.log('Shape is already selected. Deselecting...');
                        return prevSelectedShapes.filter(shape => shape.id !== clickedShape.id);
                    } else {
                        console.log('Shape is not selected. Adding to selection...');
                        return [...prevSelectedShapes, clickedShape];
                    }
                });
            } else {
                // Single selection if Ctrl is not pressed
                console.log('Single selection mode. Selected shape:', clickedShape);
                setSelectedShapes([clickedShape]);
            }
        }
        
        
        
          // If clicking on empty space, initialize the selection rectangle
          if (rectangleToolActive && !clickedShape) {
            setIsSelecting(true);
            setStartPoint({ x: pointerPosition.x, y: pointerPosition.y });
            setSelectionRect({ x: pointerPosition.x, y: pointerPosition.y, width: 0, height: 0 });
          }
        }
   
};

export default handleMouseDown;
