import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { Stage, Layer, Rect, Transformer, Line } from 'react-konva';
import handleMouseDown from './operations/handleMouseDown';
import handleMouseMove from './operations/handleMouseMove';
import handleMouseUp from './operations/handleMouseUp';
import updateShapesWithLayer from './operations/updateShapesWithLayer';
import drawShapesWithVisibility from './operations/drawShapesWithVisibility';
import deleteSelectedShapes from './operations/deleteSelectedShapes';
import copySelectedShapes from './operations/copySelectedShapes';
import saveShapesToFile from './operations/saveShapesToFile';
import loadShapesFromFile from './operations/loadShapesFromFile';
import handleMouseHover from './operations/handleMouseHover';
import handleZoom from './operations/handleZoom';
import handleCrop from './operations/handleCrop';
import { activateDraggingMode, deactivateDraggingMode } from './operations/handleDraggingMode';
import handleDefaultResize from './operations/handleDefaultResize';
import { startMoving } from './operations/moveSelectedShapes'; 
import DesignNamePopup from './operations/DesignNamePopup';
import { handleKeyboardCopyPaste } from './operations/handleKeyboardCopyPaste';
import { handleDragAndDrop } from './operations/handleDragAndDrop';
import fitToScreen from './operations/fitToScreen';



import './CanvasComponent.css';

const CanvasComponent = forwardRef(({ selectedLayer, allLayers, layerVisibility, lockedLayers, shapes, setShapes,setGroupedShapes }, ref) => {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const groupRef = useRef(null);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState(null);
  const [rectangleToolActive, setRectangleToolActive] = useState(false);
  const [hoveredShape, setHoveredShape] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const layerRef = useRef(null);
  const [showDesignNamePopup, setShowDesignNamePopup] = useState(false);
  const [groupRect, setGroupRect] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const canvasRef = useRef(null);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  
  

  useEffect(() => {
    if (selectedLayer) {
        updateShapesWithLayer(shapes, setShapes, selectedLayer);
    }
}, [selectedLayer]);

  useEffect(() => {
    if (selectedLayer) {
      const updatedShapes = shapes.map(shape => 
        shape.layerId === selectedLayer.layer_number ? { ...shape, color: selectedLayer.color } : shape
      );
      setShapes(updatedShapes);
    }
  }, [selectedLayer]);
  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        deleteSelectedShapes(shapes, selectedShapes, setShapes, setSelectedShapes);
        transformerRef.current.nodes([]); // Clear the transformer selection
      }
  
      handleKeyboardCopyPaste(e, selectedShapes, shapes, setShapes, transformerRef, stageRef);
      handleDragAndDrop(e, selectedShapes, setSelectedShapes, stageRef, shapes, setShapes);
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shapes, selectedShapes]);

  

  


   
  






  const openPopup = (group) => {
    setCurrentGroup(group);
    setShowDesignNamePopup(true);
    alert('pop up open')
  };

  
  const handleDesignNameSave = (designName) => {
    if (currentGroup) {
      const groupRect = currentGroup.getClientRect();
      const groupRectCenterX = groupRect.x + groupRect.width / 2;
      const groupRectCenterY = groupRect.y + groupRect.height / 2;

      const label = new Konva.Text({
        x: groupRectCenterX,
        y: groupRectCenterY,
        text: designName,
        fontSize: 16,
        fill: 'black',
        align: 'center',
      });

      // Adjust label position to center it
      label.offsetX(label.width() / 2);
      label.offsetY(label.height() / 2);

      layerRef.current.add(label);
      layerRef.current.batchDraw();

      setShowDesignNamePopup(false);
      setCurrentGroup(null);
    }
  };

  

  const handleDesignNameCancel = () => {
    setShowDesignNamePopup(false);
    setCurrentGroup(null);
  };


  useImperativeHandle(ref, () => ({
    activateRectangleTool() {
      setRectangleToolActive(true);
      addEscapeListener(deactivateRectangleTool, 'Escape');
    },
    handleDeleteShapesInternal() {
      deleteSelectedShapes(shapes, selectedShapes, setShapes, setSelectedShapes);
      transformerRef.current.nodes([]);
    },
    handleCopyShapesInternal() {
      copySelectedShapes(shapes, selectedShapes, setShapes, setSelectedShapes);
    },
    saveShapes() {
      saveShapesToFile(shapes);
    },
    loadShapes(event, setShapes) {
      loadShapesFromFile(event, setShapes);
      console.log('Loaded shapes:', shapes);

    },
    
    activateCrop() {
      setIsCropping(true);
      handleCrop(stageRef, shapes, setShapes, setIsCropping);
      addEscapeListener(deactivateCropTool, 'c');
    },
    setLayerVisibility(layerNumber, visibility) {
        const updatedShapes = shapes.map(shape =>
            shape.layerId === layerNumber ? { ...shape, visible: visibility } : shape
        );
        setShapes(updatedShapes);
    },

    setAllLayersVisibility(isVisible) {
      const updatedShapes = shapes.map(shape => ({
        ...shape,
        visible: isVisible
      }));
      setShapes(updatedShapes);
    },
    lockShapesInLayer(layer) {
        const updatedShapes = shapes.map(shape => (shape.layerId === layer.layer_number ? { ...shape, draggable: false } : shape));
        setShapes(updatedShapes);
    },
    unlockShapesInLayer(layer) {
        const updatedShapes = shapes.map(shape => (shape.layerId === layer.layer_number ? { ...shape, draggable: true } : shape));
        setShapes(updatedShapes);
    },
    fitToScreen() {
      alert("ref call")
      if (stageRef.current && layerRef.current) {
        alert("if condistion true")
        fitToScreen(stageRef.current, layerRef.current, shapes);
        
      }
    }
  }));
  

  const addEscapeListener = (deactivateFunction, key) => {
    const handleKeyDown = (event) => {
      if (event.key === key) {
        deactivateFunction();
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
  };

  const deactivateRectangleTool = () => {
    setRectangleToolActive(false);
  };

  const deactivateCropTool = () => {
    setIsCropping(false);
    const tempCropRect = stageRef.current.findOne('.tempCropRect');
    if (tempCropRect) {
      tempCropRect.destroy();
      stageRef.current.draw();
    }
  };
  
  
  const handleDragEnd = (e, index) => {
    if (!rectangleToolActive && !isResizing) {
      const stage = e.target.getStage();
      const pointerPosition = e.target.position();
      const newShapes = shapes.slice();
      newShapes[index] = {
        ...newShapes[index],
        x: pointerPosition.x,
        y: pointerPosition.y,
      };
      setShapes(newShapes);
    }
  };

  const handleResize = (e) => {
    const node = transformerRef.current.node();
    const newAttrs = node.getAttrs();
    const newShapes = shapes.map(shape => shape === selectedShapes[0] ? { ...shape, ...newAttrs } : shape);
    setShapes(newShapes);
  };
  
  

  const onSelectShape = (e, shape) => {
    const transformerNode = transformerRef.current;
  
    // Check if the clicked target is part of the Transformer handles
    if (e.target.getParent() && e.target.getParent().className === 'Transformer') {
      return; // Prevent selection change if interacting with resize/rotate handles
    }
  
    // Log the shape being selected (for debugging purposes)
    console.log('Shape being selected:', shape);
  
    if (shape instanceof window.Konva.Rect || shape instanceof window.Konva.Line) {
      setSelectedShapes([shape]);
      transformerNode.nodes([shape]); // Attach the Transformer to the shape
      transformerNode.getLayer().batchDraw();
    }
  };
  
  console.log(window.innerWidth, window.innerHeight)
  
  return (
    <div className="canvas-container">
      <Stage
        draggable={true}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={(e) => handleMouseDown(e, setIsDrawing, setNewShape, selectedLayer, setSelectedShapes, shapes, selectedShapes, rectangleToolActive, transformerRef)}
        onMouseMove={(e) => handleMouseMove(e, isDrawing, newShape, setNewShape, isDraggingMode, selectedShapes, stageRef)}
      
        onMouseUp={() => handleMouseUp(isDrawing, newShape, setShapes, setNewShape, setIsDrawing)}
        ref={stageRef}
        onWheel={(e) => handleZoom(e, stageRef)}
      >
        <Layer ref={layerRef} offsetX={-window.innerWidth / 2}  // Negative offsets to move the origin to the center
    offsetY={-window.innerHeight / 2}
    x={0}          // Position the layer at the center of the stage
    y={0} >
          {/* Draw horizontal line */}
          <Line
            points={[-window.innerWidth*100, 0, window.innerWidth*100, 0]} // Line from far left to far right across the center
            stroke="white"
            strokeWidth={1}
          />
          {/* Draw vertical line */}
          <Line
            points={[0, -window.innerHeight*100, 0, window.innerHeight*100]} // Line from top to bottom across the center
            stroke="white"
            strokeWidth={1}
          />

          {shapes.map((shape, index) => (
            shape.visible && (
              shape.type === 'Polygon' ? (
                <Line
                  key={shape.id} 
                  points={shape.points}
                  fill={shape.color}
                  closed
                  opacity={shape.opacity}
                  stroke={selectedShapes.includes(shape) ? 'white' : shape.boundaryColor}
                  strokeWidth={selectedShapes.includes(shape) ? 3 : 2}
                  dash={selectedShapes.includes(shape) ? [6, 4] : []} // Add dashed border for selected shapes
                  draggable={!rectangleToolActive && !isResizing}

                  onDragEnd={(e) => handleDragEnd(e, index)}
                  onMouseEnter={() => handleMouseHover(shape, setHoveredShape)}
                  onMouseLeave={() => setHoveredShape(null)}
                  onClick={(e) => onSelectShape(e,shape)}
                  ref={(node) => {
                    if (selectedShapes.length === 1 && selectedShapes[0] === shape && node) {
                      transformerRef.current.nodes([node]);
                      transformerRef.current.getLayer().batchDraw();
                    }
                  }}
                />
              ) : (
                <Rect
                  key={shape.id} 
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.color}
                  opacity={shape.opacity}
                  
                  stroke={selectedShapes.includes(shape) ? 'white' : shape.boundaryColor}
                  strokeWidth={selectedShapes.includes(shape) ? 3 : 2}
                  dash={selectedShapes.includes(shape) ? [6, 4] : []} // Add dashed border for selected shapes
                  draggable={!rectangleToolActive && !isResizing}
                  
                  onDragEnd={(e) => handleDragEnd(e, index)}
                  onMouseEnter={() => handleMouseHover(shape, setHoveredShape)}
                  onMouseLeave={() => setHoveredShape(null)}
                  className="shape"
                
                  onClick={(e) => onSelectShape(e,shape)}
                  ref={(node) => {
                    if (selectedShapes.length === 1 && selectedShapes[0] === shape && node) {
                      transformerRef.current.nodes([node]);
                      transformerRef.current.getLayer().batchDraw();
                    }
                  }}
                />
              )
            )
          ))}
          {newShape && (
            <Rect
              
              x={newShape.x}
              y={newShape.y}
              width={newShape.width}
              height={newShape.height}
              fill={newShape.color}
              opacity={newShape.opacity}
              stroke={newShape.boundaryColor}
              strokeWidth={2}
              dash={newShape.pattern === 'dotted' ? [2, 2] : []}
              draggable={!rectangleToolActive && !isCropping && !isResizing}
            />
          )}
          <Transformer ref={transformerRef} onTransformEnd={handleResize} />
        </Layer>
      </Stage>
      
      <input
        type="file"
        id="fileInput"
        onChange={(e) => loadShapesFromFile(e, setShapes)}
        accept=".json"
        style={{ display: 'none' }}
      />
      
    </div>
  );
});

export default CanvasComponent;