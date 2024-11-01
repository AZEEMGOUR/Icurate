import { saveState as saveUndoState } from './undo';

const handleMouseMove = (e, isDrawing, newShape, setNewShape, isDraggingMode, selectedShapes, stageRef, lockedLayers, isAllLocked,isRulerActive, startPoint, setEndPoint,lineFinalized, setDistance,  scaleType,
    unit,selectionRect, // Added for selection rectangle
    setSelectionRect,setMousePosition, isSelecting, isCutting, cutStartPoint, setCutRect) => {
    //console.log("handleMouseMove triggered");

    const stage = stageRef.current;
    const mousePos = stage.getPointerPosition();
    const scale = stage.scaleX();
    const scaleX = stage.scaleX();
    const scaleY = stage.scaleY();
    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;


    const adjustedMousePos = {
        x: (mousePos.x - centerX) / scaleX,
        y: (mousePos.y - centerY) / scaleY,
    };

    setMousePosition(adjustedMousePos);



    if (isCutting && cutStartPoint) {
        const stage = stageRef.current;
        const pointerPosition = stage.getRelativePointerPosition();
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;
      
        // Update the dimensions of the cutting rectangle
        const newWidth = adjustedX - cutStartPoint.x;
        const newHeight = adjustedY - cutStartPoint.y;
      
        setCutRect({
          x: newWidth < 0 ? adjustedX : cutStartPoint.x,
          y: newHeight < 0 ? adjustedY : cutStartPoint.y,
          width: Math.abs(newWidth),
          height: Math.abs(newHeight),
        });
      }
      
      

    if (isSelecting && startPoint && !isDraggingMode) {
        const pointerPosition = stage.getRelativePointerPosition();
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;
        
        // Calculate the width and height of the selection rectangle
        const newWidth = adjustedX - startPoint.x;
        const newHeight = adjustedY - startPoint.y;
    
        // Set the selection rectangle, accounting for dragging in any direction
        setSelectionRect({
          x: newWidth < 0 ? adjustedX : startPoint.x, // Adjust x if dragging leftwards
          y: newHeight < 0 ? adjustedY : startPoint.y, // Adjust y if dragging upwards
          width: Math.abs(newWidth), // Always use positive width
          height: Math.abs(newHeight), // Always use positive height
        });
      }
    
    
    
    

    

    // Update the mouse position state
    if (mousePos && setMousePosition) {
        // Adjust the mouse position based on zoom level
        const adjustedX = (mousePos.x - stage.width() / 2) / scale;
        const adjustedY = (mousePos.y - stage.height() / 2) / scale;
    
        // Threshold for detecting near the center (0, 0)
        const threshold = 5 / scale; // Adjust the threshold based on zoom level
    
        if (Math.abs(adjustedX) < threshold && Math.abs(adjustedY) < threshold) {
            setMousePosition({ x: 0, y: 0 });
        } else {
            setMousePosition({ x: adjustedX, y: adjustedY });
        }
    }
    
    if (isRulerActive && startPoint && !lineFinalized) {
        const stage = e.target.getStage();
        const pointerPosition = stage.getRelativePointerPosition();
        const scale = stage.scaleX(); // Assuming uniform scaling (same for X and Y)

        if (!pointerPosition) {
            //console.warn("Pointer position is not available.");
            return;
        }
        const initialMousePos = stage.getRelativePointerPosition(); // Get mouse position
        const adjustedXinit = initialMousePos.x - stage.width() / 2;
        const adjustedYinit = initialMousePos.y - stage.height() / 2;
        
        // Adjust the pointer position based on the stage scale
        let adjustedX = pointerPosition.x - stage.width() / 2 ;
        let adjustedY = pointerPosition.y - stage.height() / 2;

        // Apply scale type constraints
        if (scaleType === 'horizontal') {
            adjustedY = startPoint.y;  // Lock movement to horizontal axis
        } else if (scaleType === 'vertical') {
            adjustedX = startPoint.x;  // Lock movement to vertical axis
        } else if (scaleType === 'diagonal') {
            const diagDist = Math.min(Math.abs(adjustedX - adjustedXinit), Math.abs(adjustedY - adjustedYinit));
            adjustedX = adjustedXinit + diagDist * Math.sign(adjustedX - adjustedXinit);
            adjustedY = adjustedYinit + diagDist * Math.sign(adjustedY - adjustedYinit);
        }

        setEndPoint({ x: adjustedX, y: adjustedY });

        const dx = adjustedX - adjustedXinit;
        const dy = adjustedY - adjustedYinit;

        let dist = Math.sqrt(dx * dx + dy * dy);
        if (unit === 'cm') {
            dist /= 37.7952755906;  // Convert pixels to cm
        } else if (unit === 'inch') {
            dist /= 96;  // Convert pixels to inches
        }

        setDistance(dist.toFixed(2) + ' ' + unit);

        
        return;
    }

    // if (selectionRect && startPoint) {
    //     const stage = e.target.getStage();
    //     const pointerPosition = stage.getPointerPosition();
    //     const adjustedX = pointerPosition.x - stage.width() / 2;
    //     const adjustedY = pointerPosition.y - stage.height() / 2;

    //     setSelectionRect(prevRect => ({
    //         ...prevRect,
    //         width: adjustedX - startPoint.x,
    //         height: adjustedY - startPoint.y
    //     }));
    // }



    if (isDrawing) {
        //console.log("Updating new shape while drawing");

        const stage = e.target.getStage();
        const pointerPosition = stage.getRelativePointerPosition();
        const scale = stage.scaleX();
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;

        const updatedShape = {
            ...newShape,
            width: adjustedX - newShape.x,
            height: adjustedY - newShape.y,
        };
        //console.log("Updated shape:", updatedShape);
        setNewShape(updatedShape);
    } else if (isDraggingMode) {
        
        const stage=stageRef.current;
        const pointerPosition = stage.getRelativePointerPosition();
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;
        // Adjust dragging positions for zoom level
        const updatedShapes = selectedShapes.map(shape => ({
            ...shape,
            x: adjustedX - shape.width/2 ,
            y: adjustedY - shape.height/2 ,
        }));

        setNewShape(updatedShapes);
    }
};

export default handleMouseMove;
