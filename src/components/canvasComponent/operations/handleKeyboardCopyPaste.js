let copiedShapes = [];

export function handleKeyboardCopyPaste(e, selectedShapes, shapes, setShapes, transformerRef, stageRef) {
  if (e.ctrlKey && e.key === 'c') {
    // Ctrl+C pressed: Copy selected shapes
    copiedShapes = selectedShapes.map(shape => ({
      ...shape,
      relativeX: shape.x - selectedShapes[0].x,  // Calculate relative X position
      relativeY: shape.y - selectedShapes[0].y,  // Calculate relative Y position
    }));
  } else if (e.ctrlKey && e.key === 'x') {
    // Ctrl+X pressed: Cut selected shapes
    copiedShapes = selectedShapes.map(shape => ({
      ...shape,
      relativeX: shape.x - selectedShapes[0].x,  // Calculate relative X position
      relativeY: shape.y - selectedShapes[0].y,  // Calculate relative Y position
    }));
    // Remove the selected shapes from the canvas
    setShapes(prevShapes => prevShapes.filter(shape => !selectedShapes.includes(shape)));
    transformerRef.current.nodes([]); // Clear the transformer selection
  } else if (e.ctrlKey && e.key === 'v') {
    // Ctrl+V pressed: Paste copied shapes at mouse position
    if (copiedShapes.length > 0) {
      const stage = stageRef.current;
      const mousePos = stage.getPointerPosition();
      const scaleX = stage.scaleX();  // Get the current scale of the stage
      const scaleY = stage.scaleY();

      // Adjust mouse position based on the origin shift
      const adjustedMousePosX = mousePos.x - stage.width() / 2;
      const adjustedMousePosY = mousePos.y - stage.height() / 2;

      const newShapes = copiedShapes.map((shape, index) => ({
        ...shape,
        x: adjustedMousePosX + shape.relativeX / scaleX,
        y: adjustedMousePosY + shape.relativeY / scaleY,
        id: `${shape.id}_copy_${Date.now()}_${index}`, // Assign new unique ID
      }));

      setShapes(prevShapes => [...prevShapes, ...newShapes]);
      transformerRef.current.nodes([]); // Clear the transformer selection

      // Clear copiedShapes after pasting
      copiedShapes = [];
    }
  }
}
