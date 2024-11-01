const handleZoom = (e, stageRef, setScale, setPosition) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
  
    const pointer = stage.getPointerPosition();
  
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
  
    const newScale = e.evt.deltaY > 0 ? oldScale * 1.1 : oldScale / 1.1;
    setScale(newScale); // Update the scale state
  
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos); // Update the position state
  
    // Redraw stage
    stage.batchDraw();
  
    // Optionally handle axis line stroke width based on the new scale
    const layer = stage.findOne('Layer');
    const xAxisLine = layer.findOne('#xAxisLine');
    const yAxisLine = layer.findOne('#yAxisLine');
    const ruler=layer.findOne('ruler')
  
    if (xAxisLine) xAxisLine.strokeWidth(1 / newScale);
    if (yAxisLine) yAxisLine.strokeWidth(1 / newScale);
    if (ruler) {
      // Adjust the stroke width
      ruler.strokeWidth(2 / newScale);

      // Adjust the points for the ruler line by dividing by the new scale
      const originalPoints = ruler.points();
      const adjustedPoints = originalPoints.map(point => point / newScale);
      ruler.points(adjustedPoints); // Set the adjusted points back to the ruler

      // Redraw the layer to reflect changes
      layer.batchDraw();

    }


    
  };
  
  export default handleZoom;
  