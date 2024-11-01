import React from 'react';

const AddMissingLayersPopup = ({ isOpen, onClose, missingLayers = [], layers, setLayers,  setTriggerSave }) => {
  const handleAdd = () => {
    const existingLayerKeys = layers.map(layer => `${layer.layer_number}-${layer.datatype_number}`);

    const newLayers = missingLayers
      .filter(layer => !existingLayerKeys.includes(`${layer.layer_number}-${layer.datatype_number}`))
      .map((layer) => ({
        layer_number: layer.layer_number,
        datatype_number: layer.datatype_number,
        layer_name: `NewLayer${layer.layer_number}`,
        datatype_name: `NewDatatype${layer.datatype_number}`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
        boundaryColor: '#000000',
        pattern: { type: 'solid', opacity: 1 },
        pixelate: 0,
        contrast: 0,
      }));

    // Update the layers locally only with new layers
    const updatedLayers = [...layers, ...newLayers];
    setLayers(updatedLayers);

    setTriggerSave(); // Trigger the save function

    onClose(); // Close the popup
  };
  return isOpen ? (
    <div className="popup-container">
      <div className="popup-content">
        <h3>Missing Layers Detected</h3>
        <ul>
          {Array.isArray(missingLayers) && missingLayers.length > 0 ? (
            missingLayers.map((layer, index) => (
              <li key={index}>
                Layer Number: {layer.layer_number}, Datatype Number: {layer.datatype_number}
              </li>
            ))
          ) : (
            <li>No missing layers</li>
          )}
        </ul>
        {missingLayers.length > 0 && <button onClick={handleAdd}>Add Missing Layers</button>}
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  ) : null;
};

export default AddMissingLayersPopup;
