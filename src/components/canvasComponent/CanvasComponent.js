import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import { Pixelate } from 'konva/lib/filters/Pixelate';
import { Contrast } from 'konva/lib/filters/Contrast';
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
import { handleKeyboardDragMode } from './operations/handleKeyboardDragMode';
import fitToScreen from './operations/fitToScreen';



import './CanvasComponent.css';

const CanvasComponent = forwardRef(({ selectedLayer, allLayers, layerVisibility, lockedLayers, shapes, setShapes,setGroupedShapes,isAllLocked}, ref) => {
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [transformers, setTransformers] = useState([]);
  const [transformerRefs, setTransformerRefs] = useState([]);
  
  
  
  
  
  
  

  useEffect(() => {
    if (selectedLayer) {
        updateShapesWithLayer(shapes, setShapes, selectedLayer);
    }
}, [selectedLayer]);

  useEffect(() => {
    if (selectedLayer) {
        const updatedShapes = shapes.map(shape => {
            // Ensure that all relevant properties of the layer are considered
            if (shape.layerId === selectedLayer.layer_number && shape.datatypeId === selectedLayer.datatype_number) {
                return {
                    ...shape,
                    color: selectedLayer.color, // Update color
                    boundaryColor: selectedLayer.boundaryColor, // Update boundary color
                    opacity: selectedLayer.pattern.opacity, // Update opacity
                    pixelSize: selectedLayer.pixelate,
                    contrast: selectedLayer.contrast,
                    filters: [Pixelate, Contrast]
                };
            }
            return shape;
        });
        setShapes(updatedShapes);
    }
  }, [selectedLayer]);


  useEffect(() => {
    if (layerRef.current) {
        layerRef.current.batchDraw(); // Redraws the layer when shapes are updated
    }
  }, [shapes]);


  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        deleteSelectedShapes(shapes, selectedShapes, setShapes, setSelectedShapes);
         // Clear the transformer selection
        if (transformerRef.current) {
          transformerRef.current.nodes([]); // Clear the transformer selection
        }
      }
  
      handleKeyboardCopyPaste(e, selectedShapes, shapes, setShapes, transformerRef, stageRef);
      handleDragAndDrop(e, selectedShapes, setSelectedShapes, stageRef, shapes, setShapes);
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shapes, selectedShapes]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      handleKeyboardDragMode(e, isDraggingMode, setIsDraggingMode, stageRef);  // Handle keyboard drag mode
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDraggingMode]);
  

  

  useEffect(() => {
    if (transformerRef.current) {
      const nodes = selectedShapes.map(shape => layerRef.current.findOne(`#${shape.id}`)).filter(node => node !== undefined);
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedShapes]);
  
  
   
  




  

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
      if (transformerRef.current && transformerRef.current.nodes()) {
        transformerRef.current.nodes([]); // Clear the transformer selection
      }
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
    lockAllShapes() {
      const updatedShapes = shapes.map((shape) => ({ ...shape, draggable: false }));
      setShapes(updatedShapes);
    },
    unlockAllShapes() {
      const updatedShapes = shapes.map((shape) => ({ ...shape, draggable: true }));
      setShapes(updatedShapes);
    },
    lockShapesInLayer(layer) {
      alert("layerlocked")
      const updatedShapes = shapes.map((shape) =>
        shape.layerId === layer.layer_number ? { ...shape, draggable: false } : shape
      );
      setShapes(updatedShapes);
    },
    unlockShapesInLayer(layer) {
      const updatedShapes = shapes.map((shape) =>
        shape.layerId === layer.layer_number ? { ...shape, draggable: true } : shape
      );
      setShapes(updatedShapes);
    },
    fitToScreen() {
      alert("ref call")
      if (stageRef.current && layerRef.current) {
        alert("if condistion true")
        fitToScreen(stageRef.current, layerRef.current, shapes);
        
      }
    },
    getSelectedShapes() {
      return selectedShapes.length > 0 ? selectedShapes[0] : null;
    },
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
  const isShapeDraggable = (shape) => {
      const isLayerLocked = lockedLayers[`${shape.layerId}-${shape.datatypeId}`];
      return !rectangleToolActive && !isResizing && !isLayerLocked && !isAllLocked;
    };

  const handleResize = () => {
    if (!transformerRef.current) return;

    const nodes = transformerRef.current.nodes();
    if (!nodes || nodes.length === 0) return;

    const newShapes = shapes.map(shape => {
        const node = nodes.find(n => n.id() === shape.id);
        if (node) {
            // Update shape properties based on the transformer's node
            return { 
                ...shape, 
                x: node.x(), 
                y: node.y(),
                width: node.width(), 
                height: node.height(),
                scaleX: node.scaleX(), 
                scaleY: node.scaleY()
            };
        }
        return shape;
    });

    setShapes(newShapes);

    // Reset the scale on the nodes after resizing
    nodes.forEach(node => {
        node.scaleX(1);
        node.scaleY(1);
    });

    transformerRef.current.getLayer().batchDraw();
};

  
  

  const onSelectShape = (shape, isCtrlPressed) => {
    if (shape instanceof window.Konva.Rect || shape instanceof window.Konva.Line) {
      setSelectedShapes(prevSelectedShapes => {
        if (isCtrlPressed) {
          // Handle multi-selection with Ctrl key
          if (prevSelectedShapes.includes(shape)) {
            return prevSelectedShapes.filter(s => s !== shape);
          } else {
            return [...prevSelectedShapes, shape];
          }
        } else {
          // Handle single selection
          return [shape];
        }
      });
    }
  };

  


  
  

  
  
  

  return (
    <div className="canvas-container">
      <Stage
        draggable={false}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={(e) => handleMouseDown(e, setIsDrawing, setNewShape, selectedLayer, setSelectedShapes, shapes, selectedShapes, rectangleToolActive, transformerRef,lockedLayers,isAllLocked)}
        onMouseMove={(e) => handleMouseMove(e, isDrawing, newShape, setNewShape, isDraggingMode, selectedShapes, stageRef, lockedLayers, isAllLocked)}
        onMouseUp={() => handleMouseUp(isDrawing, newShape, setShapes, setNewShape, setIsDrawing,isAllLocked)}
        ref={stageRef}
        onWheel={(e) => handleZoom(e, stageRef)}
      >
        <Layer
          ref={layerRef}
          offsetX={-window.innerWidth / 2} // Negative offsets to move the origin to the center
          offsetY={-window.innerHeight / 2} 
          x={0} 
          y={0}
        >
          {/* Draw horizontal line */}
          <Line
            points={[-window.innerWidth * 100, 0, window.innerWidth * 100, 0]} // Line from far left to far right across the center
            stroke="white"
            strokeWidth={1}
          />
          {/* Draw vertical line */}
          <Line
            points={[0, -window.innerHeight * 100, 0, window.innerHeight * 100]} // Line from top to bottom across the center
            stroke="white"
            strokeWidth={1}
          />
  
  {shapes.map((shape, index) => {
        const shapeRef = React.createRef();
        const transformerRef = React.createRef();

        //const isShapeDraggable = !rectangleToolActive && !isResizing && !lockedLayers[`${shape.layerId}-${shape.datatypeId}`];
        return shape.visible && (
              <React.Fragment key={shape.id}>
                {shape.type === 'Polygon' ? (
                  <Line
                    points={shape.points}
                    fill={shape.color}
                    closed
                    opacity={shape.opacity}
                    stroke={selectedShapes.includes(shape) ? 'white' : shape.boundaryColor}
                    strokeWidth={selectedShapes.includes(shape) ? 3 : 2}
                    dash={selectedShapes.includes(shape) ? [6, 4] : []}
                    draggable={isShapeDraggable(shape)}
                    onDragEnd={(e) => handleDragEnd(e, index)}
                    onMouseEnter={() => handleMouseHover(shape, setHoveredShape)}
                    onMouseLeave={() => setHoveredShape(null)}
                    onClick={(e) => onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}
                    filters={[Konva.Filters.Pixelate, Konva.Filters.Contrast]} // Ensure filters are applied
                    pixelSize={shape.pixelSize}
                    contrast={shape.contrast}
                    id={shape.id}
                    ref={shapeRef}
                  />
                ) : (
                  <Rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={shape.color}
                    opacity={shape.opacity}
                    draggable={isShapeDraggable(shape)}
                    onDragEnd={(e) => handleDragEnd(e, index)}
                    onMouseEnter={() => handleMouseHover(shape, setHoveredShape)}
                    onMouseLeave={() => setHoveredShape(null)}
                    className="shape"
                    visible={shape.visible}
                    onClick={(e) => onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}
                    filters={[Konva.Filters.Pixelate, Konva.Filters.Contrast]} // Ensure filters are applied
                    pixelSize={shape.pixelSize}
                    contrast={shape.contrast}
                    id={shape.id}
                    ref={shapeRef}
                  />
                )}
                {selectedShapes.includes(shape) && (
              <Transformer
                ref={(ref) => {
                  if (ref) {
                    ref.nodes([shapeRef.current]);
                    ref.getLayer().batchDraw();
                  }
                }}
                resizeEnabled={true}
                rotateEnabled={true}
                rotateAnchorOffset={60}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onTransformEnd={handleResize}
              />
        )}
              </React.Fragment>
            );
          })}
          {newShape && (
            <Rect
              x={newShape.x}
              y={newShape.y}
              width={newShape.width}
              height={newShape.height}
              fill={newShape.color}
              opacity={newShape.opacity}
              draggable={!rectangleToolActive && !isCropping && !isResizing}
            />
          )}

          
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