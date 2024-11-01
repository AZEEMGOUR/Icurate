const pasteCopiedShapes = (copiedShapes, shapes, setShapes, pointerPosition) => {
    if (!copiedShapes || copiedShapes.length === 0) return;
  
    // Use the position of the first shape as the base for relative positioning
    const baseX = copiedShapes[0].x;
    const baseY = copiedShapes[0].y;
  
    const pastedShapes = copiedShapes.map(shape => {
      // For groups, apply relative positioning for children
      if (shape.type === 'group') {
        const pastedGroupChildren = shape.children.map(child => ({
          ...child,
          x: pointerPosition.x + (child.x - baseX),
          y: pointerPosition.y + (child.y - baseY),
          id: `${child.id}-paste-${Date.now()}-${Math.random()}`,
        }));
  
        return {
          ...shape,
          x: pointerPosition.x,
          y: pointerPosition.y,
          id: `${shape.id}-paste-${Date.now()}-${Math.random()}`,
          children: pastedGroupChildren,
        };
      }
  
      // For single shapes, apply relative positioning based on the base shape
      return {
        ...shape,
        x: pointerPosition.x + (shape.x - baseX),
        y: pointerPosition.y + (shape.y - baseY),
        id: `${shape.id}-paste-${Date.now()}-${Math.random()}`,
      };
    });
  
    setShapes([...shapes, ...pastedShapes]); // Append the pasted shapes to the existing canvas shapes
  };
  
  export default pasteCopiedShapes;
  