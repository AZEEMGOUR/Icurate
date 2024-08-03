import Konva from 'konva';

let group = null;

export const startMoving = (selectedShapes, setSelectedShapes, stageRef, shapes, setShapes) => {
  if (selectedShapes.length < 2) {
    console.error("Not enough shapes selected to group and move.");
    return;
  }

  // Create a new group if it doesn't exist
  if (!group) {
    group = new Konva.Group({
      draggable: true,
    });

    selectedShapes.forEach(shapeData => {
      // Ensure shapeData has an id
      if (!shapeData.id) {
        console.error("Shape data is missing an id:", shapeData);
        return;
      }

      const layer = stageRef.current.getLayers()[0];
      const node = layer.findOne(`#${shapeData.id}`);

      if (node) {
        group.add(node);
        node.visible(true); // Ensure shape visibility is retained
        node.draggable(false); // Temporarily disable individual shape dragging
      } else {
        console.error(`Shape with id ${shapeData.id} could not be found.`);
      }
    });

    const layer = stageRef.current.getLayers()[0];
    layer.add(group);
    layer.batchDraw();

    // Update shapes state to reflect the group
    const remainingShapes = shapes.filter(shape => !selectedShapes.includes(shape));
    const groupId = `group-${Date.now()}`;
    setShapes([...remainingShapes, { id: groupId, group: true, konvaGroup: group }]);

    // Update the selection to include only the group
    setSelectedShapes([{ id: groupId, group: true, konvaGroup: group }]);
  } else {
    // Ensure the group remains selected during moving
    setSelectedShapes([group]);
  }

  // Add event listener for ungrouping
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && group) {
      group.getChildren().each(node => {
        node.moveTo(group.getLayer());
        node.visible(true); // Ensure visibility is restored when ungrouping
        node.draggable(true); // Re-enable individual shape dragging
      });
      group.destroy();
      group = null;

      // Restore shapes to their original state
      const ungroupedShapes = group.getChildren().toArray().map(node => ({
        id: node.id(),
        boundaryColor: node.stroke(),
        color: node.fill(),
        height: node.height(),
        layerId: node.getAttr('layerId'),
        opacity: node.opacity(),
        pattern: node.getAttr('pattern'),
        visible: node.visible(),
        width: node.width(),
        x: node.x(),
        y: node.y()
      }));

      setShapes([...shapes, ...ungroupedShapes]);
      setSelectedShapes([]);
      stageRef.current.getLayers()[0].batchDraw();
      window.removeEventListener('keydown', handleKeyDown);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
};
