import { saveState as saveUndoState } from './undo';
const deleteSelectedShapes = (shapes, selectedShapes, setShapes, setSelectedShapes) => {

  saveUndoState(shapes);
  const shapesToDelete = selectedShapes.reduce((acc, selectedShape) => {
    if (selectedShape.type === 'instance') {
      // Find all text shapes associated with this instance
      const associatedTextShapes = shapes.filter(s =>
        s.type === 'Text' &&
        Math.abs(s.x - (selectedShape.x + selectedShape.width / 2 - (s.text.length * 4))) < 1 &&
        Math.abs(s.y - (selectedShape.y + selectedShape.height / 2 - 8)) < 1
      );

      return [...acc, selectedShape, ...associatedTextShapes];
    } else {
      return [...acc, selectedShape];
    }
  }, []);

  const remainingShapes = shapes.filter(shape => !shapesToDelete.includes(shape));

  setShapes(remainingShapes);
  setSelectedShapes([]);
};

export default deleteSelectedShapes;
