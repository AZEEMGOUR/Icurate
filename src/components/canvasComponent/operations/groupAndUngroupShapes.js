import Konva from 'konva';

export const groupShapes = (stageRef, setShapes, setSelectedShapes, openPopup) => {
  const stage = stageRef.current;
  const selectedNodes = stage.find('.shape').filter(node => node.selected);

  if (selectedNodes.length > 0) {
    const group = new Konva.Group({
      draggable: true,
    });

    selectedNodes.forEach(node => {
      group.add(node.clone());
      node.destroy();
    });

    stage.findOne('Layer').add(group);
    stage.findOne('Layer').batchDraw();

    setSelectedShapes([group]);
    openPopup(group); // Handle popup if needed

    // Update shapes in state
    setShapes(prevShapes => [...prevShapes, group]);
  }
};

export const ungroupShapes = (stageRef, setShapes, setSelectedShapes) => {
  const stage = stageRef.current;
  const selectedGroup = stage.find('.shape').find(node => node.getClassName() === 'Group' && node.selected);

  if (selectedGroup) {
    const children = selectedGroup.getChildren().map(child => child.clone());
    children.forEach(child => {
      stage.findOne('Layer').add(child);
    });

    selectedGroup.destroy();
    stage.findOne('Layer').batchDraw();

    setSelectedShapes(children);

    // Update shapes in state
    setShapes(prevShapes => [...prevShapes.filter(shape => shape !== selectedGroup), ...children]);
  }
};
