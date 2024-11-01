const copySelectedShapes = (shapes, selectedShapes, setCopiedShapes) => {
  const copiedShapes = selectedShapes.flatMap(shape => {
    if (shape.type === 'Group') {
      // Copy all child shapes of the instance (group)
      let copiedChildren = [];
      if (Array.isArray(shape.children)) {
        copiedChildren = shape.children.map(child => ({
          ...child,
          id: `${child.id}-copy-${Date.now()}-${Math.random()}`, // Unique ID for each copied child
        }));
      }

      // Find and copy associated text shapes
      const associatedText = shapes.find(s => 
        s.type === 'Text' &&
        s.x === (shape.x + shape.width / 2 - (s.text.length * 4)) &&
        s.y === (shape.y + shape.height / 2 - 8)
      );

      let copiedText = [];
      if (associatedText) {
        copiedText = {
          ...associatedText,
          id: `${associatedText.id}-copy-${Date.now()}-${Math.random()}`, // Unique ID for copied text
        };
      }

      return [
        {
          ...shape,
          id: `${shape.id}-copy-${Date.now()}-${Math.random()}`, // Unique ID for instance
          children: copiedChildren,
        },
        ...copiedChildren,
        copiedText // Include the copied text
      ].filter(Boolean); // Filter out any undefined values
    } else {
      // Copy individual shapes
      return {
        ...shape,
        id: `${shape.id}-copy-${Date.now()}-${Math.random()}`, // Unique ID for each copied shape
      };
    }
  });

  setCopiedShapes(copiedShapes); // Store copied shapes in a separate state for later pasting
};

export default copySelectedShapes;
