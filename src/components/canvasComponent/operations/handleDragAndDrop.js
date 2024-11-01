let isDragging = false;
let initialMousePos = null;
let shapeOffsets = [];

export function handleDragAndDrop(e, selectedShapes, setSelectedShapes, stageRef, shapes, setShapes, setIsDraggingMode) {
  if (!stageRef.current) return;

  const stage=stageRef.current;
  
  const scaleX = stage.scaleX();  // Zoom factor
  const scaleY = stage.scaleY();
  const centerX = stage.width() / 2; // Center origin X
  const centerY = stage.height() / 2; // Center origin Y

  
        const pointerPosition = stage.getPointerPosition();
        const adjustedX = pointerPosition.x - stage.width() / 2;
        const adjustedY = pointerPosition.y - stage.height() / 2;

  if (e.key === 'm' || e.key === 'M') {
    if (selectedShapes.length > 0 && !isDragging) {
      // Start dragging
      isDragging = true;

      initialMousePos = stage.getRelativePointerPosition(); // Get mouse position
      const adjustedXinit = initialMousePos.x - stage.width() / 2;
        const adjustedYinit = initialMousePos.y - stage.height() / 2;


      // Calculate initial offset for each shape relative to the mouse position
      shapeOffsets = selectedShapes.map(shape => ({
        id: shape.id,
        initialX: shape.x,  // Store initial shape position
        initialY: shape.y,
      }));

      console.log('Initial Mouse Position:', initialMousePos);

      stage.container().style.cursor = 'move';

      // Mousemove event for dragging
      stage.on('mousemove', () => {
        if (isDragging) {
          const currentMousePos = stage.getRelativePointerPosition();
          if (!currentMousePos) return;
          const adjustedX = currentMousePos.x - stage.width() / 2;
        const adjustedY = currentMousePos.y - stage.height() / 2;

          // Adjust for zoom and center origin
          const adjustedMousePos = {
            x: (adjustedX) ,
            y: (adjustedY),
          };

          console.log('Adjusted Mouse Position:', adjustedMousePos);

          // Calculate distance moved (dx, dy) with zoom taken into account
          const dx = (adjustedX - adjustedXinit) ;
          const dy = (adjustedY - adjustedYinit) ;

          const updatedShapes = shapes.map(shape => {
            const shapeOffset = shapeOffsets.find(offset => offset.id === shape.id);
            if (shapeOffset) {
              return {
                ...shape,
                x: shapeOffset.initialX + dx,  // Adjust X position
                y: shapeOffset.initialY + dy,  // Adjust Y position
              };
            }
            return shape;
          });

          console.log('Updated Shapes:', updatedShapes);
          setShapes(updatedShapes);
        }
      });
    }
  } else if (e.key === 'Escape') {
    if (isDragging) {
      // Stop dragging
      isDragging = false;
      setIsDraggingMode(false)
      stage.container().style.cursor = 'default';
      stage.off('mousemove');
    }
  }
}
