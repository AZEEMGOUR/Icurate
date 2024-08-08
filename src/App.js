import React, { useState, useRef, useEffect } from 'react';
import CanvasComponent from './components/canvasComponent/CanvasComponent';
import CanvasToolbarComponent from './components/canvas-toolbarComponent/CanvasToolbarComponent';
import SidebarComponent from './components/sidebarComponent/SidebarComponent';
import ToolbarComponent from './components/toolbarComponent/ToolbarComponent';
import SignIn from './LoginForm';
import './App.css';

const App = () => {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedLayer, setSelectedLayer] = useState(null);
  
  const [layerVisibility, setLayerVisibility] = useState({});
  const [layers, setLayers] = useState([]);
  const [lockedLayers, setLockedLayers] = useState({});
  const [isCropping, setIsCropping] = useState(false);
  const [shapes, setShapes] = useState([]); 
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [groupedShapes, setGroupedShapes] = useState([]);
  const [isAllLocked, setIsAllLocked] = useState(false);
  const [authenticated, setAuthenticated] = useState(
    () => JSON.parse(localStorage.getItem('authenticated')) || false
  ); // Persisting authentication state
  const [activeTab, setActiveTab] = useState('layermap');


  
  

  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) {
      const selectedShapes = canvasRef.current.getSelectedShapes();
      setSelectedShapes(selectedShapes || []);  // Store all selected shapes
    }
  }, [shapes, selectedLayer]);
  

  const handleColorChange = (color) => {
    if (selectedLayer) {
      const updatedLayer = { ...selectedLayer, color };
      handleLayerUpdated(updatedLayer);
      
      // Update shapes color dynamically
      const updatedShapes = shapes.map(shape =>
        shape.layerId === updatedLayer.layer_number
          ? { ...shape, color }
          : shape
      );
      setShapes(updatedShapes);
    }
  };
  const handleToggleAllLock = () => {
    setIsAllLocked(prev => !prev);
    if (canvasRef.current) {
      if (!isAllLocked) {
        canvasRef.current.lockAllShapes();
      } else {
        canvasRef.current.unlockAllShapes();
      }
    }
  };
  

  const handleLayerSelected = (layer) => {
    setSelectedLayer(layer);
    console.log('Selected Layer:', layer);
  };

  const handleToggleLayerVisibility = (layer) => {
    const key = `${layer.layer_number}-${layer.datatype_number}`;
    const newVisibility = !layerVisibility[key];
    
    // Update the visibility state for the layer in layerVisibility
    setLayerVisibility((prev) => ({ ...prev, [key]: newVisibility }));

    // Update the visibility of shapes in the layer without affecting other properties
    const updatedShapes = shapes.map(shape => 
        (shape.layerId === layer.layer_number && shape.datatypeId === layer.datatype_number)
            ? { ...shape, visible: newVisibility } 
            : shape
    );
    setShapes(updatedShapes);

    // Optionally update the visibility at the canvas level if needed
    if (canvasRef.current) {
        canvasRef.current.setLayerVisibility(layer.layer_number, newVisibility);
    }
};



const handleToggleAllLayersVisibility = (isVisible) => {
  if (canvasRef.current) {
    canvasRef.current.setAllLayersVisibility(isVisible);
  }
};

  
  const handleToggleLayerLock = (layer) => {
    const key = `${layer.layer_number}-${layer.datatype_number}`;
    const isLocked = lockedLayers[key];
    setLockedLayers((prev) => ({
      ...prev,
      [key]: !isLocked,
    }));
    if (canvasRef.current) {
      if (isLocked) {
        canvasRef.current.unlockShapesInLayer(layer);
      } else {
        canvasRef.current.lockShapesInLayer(layer);
      }
    }
  };


  const handleLayerUpdated = (updatedLayer) => {
    const updatedLayers = layers.map(layer =>
        layer.layer_number === updatedLayer.layer_number && layer.datatype_number === updatedLayer.datatype_number
            ? updatedLayer
            : layer
    );
    setLayers(updatedLayers);
    // Update shapes here when layer properties are updated
    const updatedShapes = shapes.map(shape =>
        shape.layerId === updatedLayer.layer_number
            ? {
                ...shape,
                color: updatedLayer.color,
                boundaryColor: updatedLayer.boundaryColor,
                pattern: updatedLayer.pattern.type,
                opacity: updatedLayer.pattern.opacity,
            }
            : shape
    );
    setShapes(updatedShapes);
};

  const handleCreateRectangle = () => {
    if (canvasRef.current) {
      canvasRef.current.activateRectangleTool();
    }
  };

  const handleDeleteShapes = () => {
    if (canvasRef.current) {
      canvasRef.current.handleDeleteShapesInternal();
    }
  };
  const handleCopyShapes = () => {
    if (canvasRef.current) {
      canvasRef.current.handleCopyShapesInternal();
    }
  };
  const handleSaveShapes = () => {
    if (canvasRef.current) {
      canvasRef.current.saveShapes();
    }
  };

  const handleLoadShapes = () => {
    document.getElementById('fileInput').click();
  };
  const handleActivateCrop = () => {
    if (canvasRef.current) {
        canvasRef.current.activateCrop();
    }
  };
  const handleActivateResize = () => {
    if (canvasRef.current) {
      canvasRef.current.activateResize();
    }
  };
  const handleGroupShapes = () => {
    if (canvasRef.current) {
      canvasRef.current.groupShapes();
      
    }
  };
  const handleFitToScreen = () => {
    if (canvasRef.current) {
      canvasRef.current.fitToScreen();
    }
  };
  

  return (
    <div className="container">
      <ToolbarComponent onSquareClick={handleCreateRectangle} activateResize={handleActivateResize} onGroupClick={handleGroupShapes} className="main-toolbar" />
      <div className="main-content">
        <CanvasToolbarComponent onDeleteClick={handleDeleteShapes} onCopyClick={handleCopyShapes} onSaveClick={handleSaveShapes}
        onLoadClick={handleLoadShapes} onCropClick={handleActivateCrop} onFitToScreenClick={handleFitToScreen} className="canvas-toolbar" />
        <CanvasComponent
          ref={canvasRef}
          selectedLayer={selectedLayer}
          allLayers={layers}
          layerVisibility={layerVisibility}
          lockedLayers={lockedLayers}
          isCropping={isCropping}
          isAllLocked={isAllLocked}
          setIsCropping={setIsCropping}
          shapes={shapes}
          setShapes={setShapes}
          selectedShapes={selectedShapes}
          groupedShapes={groupedShapes}
          setGroupedShapes={setGroupedShapes}
        />
        <SidebarComponent
          onColorChange={handleColorChange}
          onLayerSelected={handleLayerSelected}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onToggleAllLayersVisibility={handleToggleAllLayersVisibility}
          onLayerUpdated={handleLayerUpdated}
          onToggleLayerLock={handleToggleLayerLock}
          onToggleAllLock={handleToggleAllLock} 
          isAllLocked={isAllLocked}
          shapes={shapes} // Pass shapes state
          setShapes={setShapes}
          layerVisibility={layerVisibility}
          lockedLayers={lockedLayers}
          groupedShapes={groupedShapes}
          selectedShape={Array.isArray(selectedShapes) && selectedShapes.length > 0 ? selectedShapes[0] : null}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};

export default App;
