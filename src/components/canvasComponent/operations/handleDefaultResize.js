import Konva from 'konva';

const handleDefaultResize = (stageRef, shapes, setShapes) => {
  const stage = stageRef.current;
  const layer = stage.findOne('Layer');

  const addResizeAnchors = (shape) => {
    const anchorSize = 10;
    const anchorColor = 'blue';

    const anchors = [
      // Top-left corner
      { x: shape.x(), y: shape.y(), cursor: 'nw-resize' },
      // Top-right corner
      { x: shape.x() + shape.width(), y: shape.y(), cursor: 'ne-resize' },
      // Bottom-left corner
      { x: shape.x(), y: shape.y() + shape.height(), cursor: 'sw-resize' },
      // Bottom-right corner
      { x: shape.x() + shape.width(), y: shape.y() + shape.height(), cursor: 'se-resize' },
      // Middle-top edge
      { x: shape.x() + shape.width() / 2, y: shape.y(), cursor: 'n-resize' },
      // Middle-bottom edge
      { x: shape.x() + shape.width() / 2, y: shape.y() + shape.height(), cursor: 's-resize' },
      // Middle-left edge
      { x: shape.x(), y: shape.y() + shape.height() / 2, cursor: 'w-resize' },
      // Middle-right edge
      { x: shape.x() + shape.width(), y: shape.y() + shape.height() / 2, cursor: 'e-resize' },
    ];

    const resizeAnchors = anchors.map((anchor, index) => {
      const anchorRect = new Konva.Rect({
        x: anchor.x - anchorSize / 2,
        y: anchor.y - anchorSize / 2,
        width: anchorSize,
        height: anchorSize,
        fill: anchorColor,
        draggable: true,
        dragBoundFunc: (pos) => ({
          x: pos.x,
          y: pos.y,
        }),
        name: `resizeAnchor_${index}`,
      });

      anchorRect.on('dragmove', (e) => {
        const anchorPos = e.target.position();
        switch (index) {
          case 0: // Top-left corner
            shape.x(anchorPos.x);
            shape.y(anchorPos.y);
            shape.width(shape.width() + (shape.x() - anchorPos.x));
            shape.height(shape.height() + (shape.y() - anchorPos.y));
            break;
          case 1: // Top-right corner
            shape.y(anchorPos.y);
            shape.width(anchorPos.x - shape.x());
            shape.height(shape.height() + (shape.y() - anchorPos.y));
            break;
          case 2: // Bottom-left corner
            shape.x(anchorPos.x);
            shape.width(shape.width() + (shape.x() - anchorPos.x));
            shape.height(anchorPos.y - shape.y());
            break;
          case 3: // Bottom-right corner
            shape.width(anchorPos.x - shape.x());
            shape.height(anchorPos.y - shape.y());
            break;
          case 4: // Middle-top edge
            shape.y(anchorPos.y);
            shape.height(shape.height() + (shape.y() - anchorPos.y));
            break;
          case 5: // Middle-bottom edge
            shape.height(anchorPos.y - shape.y());
            break;
          case 6: // Middle-left edge
            shape.x(anchorPos.x);
            shape.width(shape.width() + (shape.x() - anchorPos.x));
            break;
          case 7: // Middle-right edge
            shape.width(anchorPos.x - shape.x());
            break;
          default:
            break;
        }
        layer.batchDraw();
      });

      return anchorRect;
    });

    resizeAnchors.forEach((anchor) => {
      layer.add(anchor);
    });
    layer.batchDraw();
  };

  shapes.forEach((shape) => {
    addResizeAnchors(shape);
  });

  stage.batchDraw();
};

export default handleDefaultResize;
