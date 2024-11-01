// BoundingBoxTool.js
export const activateBoundingBoxTool = (selectedShapes, setShapes, addDesignToHierarchy, stageRef, layerRef, transformerRef, groupName) => {
  if (selectedShapes.length > 0 && stageRef.current) {
    const groupRect = calculateBoundingBox(selectedShapes);

    if (groupName) {
      // Remove Transformer before creating the bounding box
      if (transformerRef && transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
      }

      const groupId = uuidv4();

      // Adjust the child shapes relative to the group's origin and hide them
      const adjustedChildren = selectedShapes.map(shape => ({
        ...shape,
        parentId: groupId,
        x: shape.x - groupRect.x,  // Adjust X relative to the group
        y: shape.y - groupRect.y,  // Adjust Y relative to the group
        visible: false  // Hide individual shapes now part of the group
      }));

      // Create a group instance
      const group = {
        id: groupId,
        type: 'Group',
        name: groupName,  // Set group name here
        x: groupRect.x,
        y: groupRect.y,
        width: groupRect.width,
        height: groupRect.height,
        stroke: 'blue',
        strokeWidth: 2,
        fill: 'transparent',
        visible: true,
        isGroup: true,
        children: adjustedChildren  // Add the child shapes
      };

      // Update shapes in state, remove selected shapes from top-level and add group
      setShapes(prevShapes => {
        const updatedShapes = prevShapes
          .filter(shape => !selectedShapes.some(s => s.id === shape.id))  // Remove selected shapes
          .concat([group]);  // Add the group

        return updatedShapes;
      });

      // Optionally add the group to the design hierarchy
      const design = {
        id: group.id,
        name: groupName,
        x: group.x,
        y: group.y,
        width: group.width,
        height: group.height,
      };
      addDesignToHierarchy(design);

      // Redraw the layer
      if (layerRef.current) {
        layerRef.current.batchDraw();
      }
    }
  } else {
    alert("No shapes selected!");
  }
};
