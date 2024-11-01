let copiedShapes = [];
let pasteOffset = { x: 0, y: 0 }; // Initialize paste offset
import { saveState as saveUndoState } from './undo';

export function handleKeyboardCopyPaste(e, selectedShapes, shapes, setShapes, transformerRef, stageRef,lastClickPosition ) {
  
  if (e.ctrlKey && e.key === 'c') {
    
    // Ctrl+C pressed: Copy selected shapes
    copiedShapes = selectedShapes.map(shape => ({
      ...shape,
      relativeX: shape.x - selectedShapes[0].x,  // Calculate relative X position
      relativeY: shape.y - selectedShapes[0].y,  // Calculate relative Y position
    }));
    pasteOffset = { x: 0, y: 0 }; // Reset offset after copying
  } else if (e.ctrlKey && e.key === 'x') {
    // Ctrl+X pressed: Cut selected shapes
    copiedShapes = selectedShapes.map(shape => ({
      ...shape,
      relativeX: shape.x - selectedShapes[0].x,  // Calculate relative X position
      relativeY: shape.y - selectedShapes[0].y,  // Calculate relative Y position
    }));
    setShapes(prevShapes => prevShapes.filter(shape => !selectedShapes.includes(shape)));
    if (transformerRef.current) {
      transformerRef.current.nodes([]); // Clear the transformer selection
    }
    pasteOffset = { x: 0, y: 0 }; // Reset offset after cutting
  } else if (e.ctrlKey && e.key === 'v') {
    saveUndoState(shapes);
    if (copiedShapes.length > 0) {
      pasteOffset.x += 20;
      pasteOffset.y += 20;

      const newShapes = copiedShapes.map((shape, index) => {
        if (shape.type === 'Group') {
          // Assign a new ID to the group and its children
          const newGroupId = `${shape.id}_copy_${Date.now()}_${index}`;
          const adjustedChildren = shape.children.map((child, childIndex) => ({
            ...child,
            x: lastClickPosition.x + shape.relativeX + child.relativeX + pasteOffset.x,
            y: lastClickPosition.y + shape.relativeY + child.relativeY + pasteOffset.y,
            id: `${child.id}_copy_${Date.now()}_${index}_${childIndex}`, // Unique ID for each child
          }));
          
          return {
            ...shape,
            children: adjustedChildren,
            id: newGroupId, // Unique ID for group
            x: lastClickPosition.x + shape.relativeX + pasteOffset.x,
            y: lastClickPosition.y + shape.relativeY + pasteOffset.y,
          };
        } else {
          // Assign new ID for individual shapes
          return {
            ...shape,
            x: lastClickPosition.x + shape.relativeX + pasteOffset.x,
            y: lastClickPosition.y + shape.relativeY + pasteOffset.y,
            id: `${shape.id}_copy_${Date.now()}_${index}`, // Unique ID for shape
          };
        }
      });

      setShapes(prevShapes => [...prevShapes, ...newShapes]);

      if (transformerRef.current) {
        transformerRef.current.nodes([]); // Clear transformer selection
      }
    }
  }

}
