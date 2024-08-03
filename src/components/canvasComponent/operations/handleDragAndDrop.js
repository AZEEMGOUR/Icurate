let isDragging = false;
let initialMousePos = null;
let shapeOffsets = [];

export function handleDragAndDrop(e, selectedShapes, setSelectedShapes, stageRef, shapes, setShapes) {
  if (e.key === 'm' || e.key === 'M') {
    if (selectedShapes.length > 0) {
      // Start dragging
      isDragging = true;

      const stage = stageRef.current;
      const scaleX = stage.scaleX();
      const scaleY = stage.scaleY();
      initialMousePos = stage.getPointerPosition();

      // Calculate the initial offset of each shape relative to the mouse position
      shapeOffsets = selectedShapes.map(shape => {
        return {
          id: shape.id,
          initialX: shape.x,
          initialY: shape.y,
        };
      });

      stage.container().style.cursor = 'move';

      stage.on('mousemove', () => {
        if (isDragging) {
          const currentMousePos = stage.getPointerPosition();

          const dx = (currentMousePos.x - initialMousePos.x) / scaleX;
          const dy = (currentMousePos.y - initialMousePos.y) / scaleY;

          const updatedShapes = shapes.map(shape => {
            const shapeOffset = shapeOffsets.find(offset => offset.id === shape.id);
            if (shapeOffset) {
              const newX = shapeOffset.initialX + dx;
              const newY = shapeOffset.initialY + dy;

              return {
                ...shape,
                x: newX,
                y: newY,
              };
            }
            return shape;
          });

          setShapes(updatedShapes);
        }
      });
    }
  } else if (e.key === 'Escape') {
    if (isDragging) {
      // Stop dragging
      isDragging = false;

      const stage = stageRef.current;
      stage.container().style.cursor = 'default';
      stage.off('mousemove');
    }
  }
}
