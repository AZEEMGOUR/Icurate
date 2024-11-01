import { v4 as uuidv4 } from 'uuid';

export const handleLabel = (stageRef, selectedLayer, layerRef, setTextMode, saveCanvas, addLabelToSidebar, setShapes) => {
  const handleCanvasClick = (event) => {
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition(); // Get the exact pointer position on the stage
    const scale = stage.scaleX(); // Assume scaleX and scaleY are the same

    // Adjust coordinates for the centered origin and scale (zoom)
    const adjustedX = (pointerPosition.x - stage.width() / 2) / scale;
    const adjustedY = (pointerPosition.y - stage.height() / 2) / scale;

    // Create a temporary HTML input element
    const input = document.createElement('input');
    document.body.appendChild(input);

    // Position the input element where the user clicked
    input.style.position = 'absolute';
    input.style.top = `${event.evt.clientY}px`; // Use event's clientY for absolute positioning
    input.style.left = `${event.evt.clientX}px`; // Use event's clientX for absolute positioning
    input.style.fontSize = '20px'; // Match the canvas text font size
    input.style.border = 'none';
    input.style.outline = 'none';
    input.style.background = 'transparent';
    input.style.color = selectedLayer.color || 'white'; // Use the selected layer's color
    input.style.zIndex = '100'; // Ensure the input is on top of the canvas
    input.focus();

    let inputRemoved = false; // Flag to track if the input has been removed

    const removeInput = () => {
      if (!inputRemoved) {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
        inputRemoved = true; // Mark the input as removed
      }
    };

    // When the user types and hits enter, the text is drawn on the canvas
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const labelText = input.value.trim();
        if (labelText !== "") {
          const labelId = uuidv4(); // Generate a unique ID for the label
    
          // Fetch the correct layerId and datatypeId from the selected layer
          const layerId = selectedLayer.layer_number || 0; // Default to 0 if not present
          const datatypeId = selectedLayer.datatype_number || 0;
    
          // Create the label in the correct format
          const newLabel = {
            id: `label_${labelId}`,      // Unique ID for the label
            type: 'Label',               // Define type as Label
            text: labelText,             // The actual label text entered by the user
            x: adjustedX,                // X position where the user clicks
            y: adjustedY,                // Y position where the user clicks
            color: selectedLayer.color || "#000000", // Use selected layer color
            layerId: layerId,            // Use layerId from the selected layer
            datatypeId: datatypeId,  
            fontSize: 16,                // Default font size
            fontFamily: 'Arial',         // Default font family
            rotation: 0,                 // Default rotation value
            visible: true                // Make the label visible
          };
          
    
          // Add the new label to the shapes array
          setShapes((prevShapes) => [...prevShapes, newLabel]);
    
          // Add the label to the sidebar (if necessary)
          //addLabelToSidebar(labelText, { x: adjustedX, y: adjustedY, id: newLabel.id });
    
          // Save the canvas
          saveCanvas();
        }
    
        removeInput(); // Remove the input element
        setTextMode(true); // Keep the text mode active
      } else if (e.key === 'Escape') {
        removeInput(); // Remove the input if the user presses Escape
        setTextMode(false); // Exit text mode
      }
    });
    

    // Delay the removal slightly to avoid conflicts
    input.addEventListener('blur', function () {
      setTimeout(removeInput, 0);
    });
  };

  setTextMode(true);

  stageRef.current.on('click', handleCanvasClick);

  return () => {
    stageRef.current.off('click', handleCanvasClick);
  };
};
