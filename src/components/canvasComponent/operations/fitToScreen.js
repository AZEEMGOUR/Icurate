const fitToScreen = (stageRef, layerRef, shapes) => {
  if (stageRef.current && layerRef.current && shapes.length > 0) {
      const stage = stageRef.current;

      // Calculate the bounding box of all shapes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      shapes.forEach(shape => {
          minX = Math.min(minX, shape.x);
          minY = Math.min(minY, shape.y);
          maxX = Math.max(maxX, shape.x + shape.width);
          maxY = Math.max(maxY, shape.y + shape.height);
      });

      const boundingBoxWidth = maxX - minX;
      const boundingBoxHeight = maxY - minY;

      // Get the available canvas size (stage)
      const canvasWidth = stage.width();
      const canvasHeight = stage.height();

      // Calculate scale factors to fit the bounding box within the canvas
      const scaleX = canvasWidth / boundingBoxWidth;
      const scaleY = canvasHeight / boundingBoxHeight;
      const scale = Math.min(scaleX, scaleY);  // Use the smaller scale to fit both width and height

      // Calculate the center of the bounding box
      const boundingBoxCenterX = minX + boundingBoxWidth / 2;
      const boundingBoxCenterY = minY + boundingBoxHeight / 2;

      // Adjust the position based on the stage's center (taking centered origin into account)
      const stageCenterX = canvasWidth / 2;
      const stageCenterY = canvasHeight / 2;

      // The new position is the difference between the stage center and the scaled bounding box center
      const offsetX = stageCenterX - (boundingBoxCenterX * scale);
      const offsetY = stageCenterY - (boundingBoxCenterY * scale);

      // Apply the calculated scale and position
      stage.scale({ x: scale, y: scale });
      stage.position({ x: offsetX, y: offsetY });
      stage.batchDraw();
  }
};

export default fitToScreen;
