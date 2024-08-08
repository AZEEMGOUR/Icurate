let copiedShapes = [];
let pasteOffset = { x: 0, y: 0 }; // Initialize paste offset

export function handleKeyboardCopyPaste(e, selectedShapes, shapes, setShapes, transformerRef, stageRef) {
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
    // Ctrl+V pressed: Paste copied shapes
    if (copiedShapes.length > 0) {
      // Increment the offset by 20 pixels on both axes
      pasteOffset.x += 20;
      pasteOffset.y += 20;

      const newShapes = copiedShapes.map((shape, index) => ({
        ...shape,
        x: shape.x + pasteOffset.x, // Incrementally adjust x position
        y: shape.y + pasteOffset.y, // Incrementally adjust y position
        id: `${shape.id}_copy_${Date.now()}_${index}`, // Assign new unique ID
      }));

      setShapes(prevShapes => [...prevShapes, ...newShapes]);

      if (transformerRef.current) {
        transformerRef.current.nodes([]); // Clear the transformer selection
      }

      // Do not clear `copiedShapes` here, so you can paste multiple times
    }
  }
}
