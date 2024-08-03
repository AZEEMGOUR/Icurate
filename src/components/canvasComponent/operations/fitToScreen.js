const fitToScreen = (stage, layer, shapes) => {
    alert("Main function is called");
  
    if (!shapes.length) {
      console.log("No shapes to fit");
      return; // No shapes to fit
    }
  
    // Initialize the bounding box variables
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
    shapes.forEach(shape => {
      if (typeof shape.getClientRect === 'function') {
        const shapeBounds = shape.getClientRect();
        minX = Math.min(minX, shapeBounds.x);
        minY = Math.min(minY, shapeBounds.y);
        maxX = Math.max(maxX, shapeBounds.x + shapeBounds.width);
        maxY = Math.max(maxY, shapeBounds.y + shapeBounds.height);
      } else {
        console.log("Invalid shape:", shape);
      }
    });
  
    if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
      console.log("No valid shapes found");
      return;
    }
  
    // Calculate the scale to fit all shapes within the stage
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const shapesWidth = maxX - minX;
    const shapesHeight = maxY - minY;
  
    const scaleX = stageWidth / shapesWidth;
    const scaleY = stageHeight / shapesHeight;
    const scale = Math.min(scaleX, scaleY);
  
    // Apply the calculated scale and center the shapes
    stage.scale({ x: scale, y: scale });
    stage.position({
      x: stageWidth / 2 - (minX + shapesWidth / 2) * scale,
      y: stageHeight / 2 - (minY + shapesHeight / 2) * scale,
    });
  
    console.log("New stage position:", stage.position());
  
    // Redraw the layer to apply changes
    layer.batchDraw();
  };
  
  export default fitToScreen;
  