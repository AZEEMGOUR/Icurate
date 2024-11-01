import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';

import { Pixelate } from 'konva/lib/filters/Pixelate';
import { Contrast } from 'konva/lib/filters/Contrast';
import { Stage, Layer, Rect, Transformer, Line, Text, Group, Shape } from 'react-konva';
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
//import DesignNamePopup from './operations/DesignNamePopup';
import { handleKeyboardCopyPaste } from './operations/handleKeyboardCopyPaste';
import { handleDragAndDrop } from './operations/handleDragAndDrop';
import { handleKeyboardDragMode } from './operations/handleKeyboardDragMode';
import fitToScreen from './operations/fitToScreen';
import { undo, redo, saveState as saveUndoState } from './operations/undo';
//import { redo, saveState as saveRedoState } from './operations/redo';
import flipX from './operations/flipX';
import flipY from './operations/flipY';
import RulerModal from './operations/RulerModal';
import { getShapeProperties } from './operations/handleShapeProperties';
import { activateBoundingBoxTool } from './operations/BoundingBoxTool';
import { convertShapesToLayoutData } from './operations/convertShapesToLayoutData';
import './CanvasComponent.css';
import { red } from '@mui/material/colors';
import { updateVisibilityBasedOnHierarchy } from './operations/updateHierarchyVisibility';
import { handleLabel } from './operations/handleLabel';
//import LabelSettings from './operations/LabelSettings';
import loadDesignWithCoordinates from './operations/loadDesignWithCoordinates';
import GroupPopup from './operations/GroupPopup';
import pasteCopiedShapes from './operations/pasteCopiedShapes';



const CanvasComponent = forwardRef(({ stageRef, layerRef,selectedLayer, allLayers, layerVisibility, lockedLayers, shapes, setShapes,setGroupedShapes,onShapeUpdate,isAllLocked, projectName,directoryHandle, layers, addDesignToHierarchy,updateSelectedShape,addLabelToSidebar, setSelectedShapes, selectedShapes, setTopcellname, setMissingLayers}, ref) => {
  
  const transformerRef = useRef(null);
  
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [newShape, setNewShape] = useState(null);
  const [rectangleToolActive, setRectangleToolActive] = useState(false);
  const [hoveredShape, setHoveredShape] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  //const layerRef = useRef(null);
  const [showDesignNamePopup, setShowDesignNamePopup] = useState(false);
  
  const [currentGroup, setCurrentGroup] = useState(null);
  
  const [isDraggingMode, setIsDraggingMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [isRulerActive, setIsRulerActive] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [line, setLine] = useState(null);
  const [distance, setDistance] = useState(null);
  const [lineFinalized, setLineFinalized] = useState(false);
  const [scaleType, setScaleType] = useState('any'); // Default scale type
  const [unit, setUnit] = useState('px'); // Default unit
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [lastDistance, setLastDistance] = useState('');
  const [selectedShape, setSelectedShape] = useState(null);
  const [instances, setInstances] = useState([]); // Define state for instances
    const [labels, setLabels] = useState([]);
  const [selectionRect, setSelectionRect] = useState(null);  // New state
  const [isSelecting, setIsSelecting] = useState(false);
  const [firstInput, setFirstInput] = useState(0);
  const [secondInput, setSecondInput] = useState(1);
  const [textMode, setTextMode] = useState(false);
  const [isLabelSettingsOpen, setIsLabelSettingsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null); 
  const [xCoord, setXCoord] = useState(0); // State to hold the X coordinate
const [yCoord, setYCoord] = useState(0);  
const [scale, setScale] = useState(1);
const [position, setPosition] = useState({ x: 0, y: 0 });
const radToDeg = (radians) => radians * (180 / Math.PI);
const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false);
const [isCutting, setIsCutting] = useState(false);

const [cutRect, setCutRect] = useState(null); // The rectangle to define the cutting area
const [cutStartPoint, setCutStartPoint] = useState(null); // The start point for the cutting rectangle
const [copiedShapes, setCopiedShapes] = useState([]);
const [lastClickPosition, setLastClickPosition] = useState({ x: 0, y: 0 });






  
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key.toLowerCase() === 'o') {
  //       setIsLabelSettingsOpen(true);  // Open the settings UI when "O" is pressed
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);

  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'y') {
        setIsCutting(true); // Activate cutting mode when 'Y' is pressed
      } else if (e.key === 'Escape') {
        setIsCutting(false); // Deactivate cutting mode when 'Escape' is pressed
        setCutRect(null); // Clear the cutting rectangle
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  







  useEffect(() => {
    const updatedLabels = shapes.filter((shape) => shape.type === 'Label');
    
    if (updatedLabels.length > 0) {
      console.log('Labels updated:', updatedLabels);
  
      // Apply any logic to update the label display or handle additional properties
      setLabels(updatedLabels); // Update the labels state if you're using it elsewhere
    }
  }, [shapes]); // This will trigger the effect every time `shapes` is updated
//   useEffect(() => {
//     const updatedShapes = updateVisibilityBasedOnHierarchy(shapes, currentLevel, targetLevel);
//     setShapes(updatedShapes);
// }, [currentLevel, targetLevel, shapes, setShapes]);

// useEffect(() => {
//   // Ensure this logic is not overwriting visibility changes
//   const updatedShapes = shapes.map(shape => ({
//     ...shape,
//     // Ensure visibility is not reset
//     visible: shape.visible !== undefined ? shape.visible : true
//   }));
//   setShapes(updatedShapes);
// }, [shapes]);


useEffect(() => {
  console.log('Selected shapes for transformer:', selectedShapes);
  if (transformerRef.current && selectedShapes.length > 0) {
      const nodes = selectedShapes
          .map(shape => layerRef.current.findOne(`#${shape.id}`))
          .filter(Boolean);  // Filter out any invalid nodes

      if (nodes.length > 0) {
          transformerRef.current.nodes(nodes); // Apply multiple nodes to transformer
          transformerRef.current.getLayer().batchDraw(); // Redraw layer
      }
  } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
  }
}, [selectedShapes]);





useEffect(() => {
  if (transformerRef.current && selectedShapes.length > 0) {
    const nodes = selectedShapes
      .map(shape => layerRef.current.findOne(`#${shape.id}`))
      .filter(Boolean)
      .filter(node => !lockedLayers[`${node.attrs.layerId}-${node.attrs.datatypeId}`]); // Filter out locked shapes

    transformerRef.current.nodes(nodes); // Only apply Transformer to non-locked shapes
    transformerRef.current.getLayer().batchDraw();
  } else if (transformerRef.current) {
    transformerRef.current.nodes([]); // Clear Transformer nodes
    transformerRef.current.getLayer().batchDraw();
  }
}, [selectedShapes, lockedLayers]);




  useEffect(() => {
    if (textMode) {
      const cleanup = handleLabel(stageRef, selectedLayer, layerRef, setTextMode, saveCanvas, addLabelToSidebar,setShapes);
      return () => cleanup();
    }
  }, [textMode, selectedLayer]);
 
  useEffect(() => {
    if (transformerRef.current && selectedShapes.length > 0) {
        // Find all nodes for selected shapes
        const nodes = selectedShapes
            .map(shape => layerRef.current.findOne(`#${shape.id}`))
            .filter(Boolean);  // Remove any null or undefined nodes
        
        if (nodes.length > 0) {
            transformerRef.current.nodes(nodes); // Apply nodes to transformer
            transformerRef.current.getLayer().batchDraw(); // Redraw layer
        } else {
            // No valid nodes found, clear the transformer
            transformerRef.current.nodes([]);
            transformerRef.current.getLayer().batchDraw();
        }
    } else if (transformerRef.current) {
        // If no shapes are selected, clear transformer
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw();
    }
}, [selectedShapes, shapes, layerRef]);





  
  useEffect(() => {
    if (selectedShapes.length && transformerRef.current) {
      const nodes = selectedShapes.map(shape => layerRef.current.findOne(`#${shape.id}`)).filter(Boolean);
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedShapes]);
  useEffect(() => {
    console.log("Shapes updated in CanvasComponent:", shapes);
}, [shapes]);

  

  
  
  useEffect(() => {
    if (shapes.length > 0) {
      const lastShape = shapes[shapes.length - 1];
      if (lastShape.type === 'Rect' && lastShape.isInstance) {
        // Temporarily change the stroke color or width
        const updatedShapes = shapes.map(shape => 
          shape.id === lastShape.id ? { ...shape, stroke: 'red', strokeWidth: 5 } : shape
        );

        setShapes(updatedShapes);

        // Revert the stroke after a brief moment
        setTimeout(() => {
          const revertedShapes = updatedShapes.map(shape => 
            shape.id === lastShape.id ? { ...shape, stroke: 'blue', strokeWidth: 2 } : shape
          );
          setShapes(revertedShapes);
        }, 1000); // Revert after 1 second
      }
    }
  }, [shapes]);
  useEffect(() => {
    if (transformerRef.current) {
        const selectedNodes = selectedShapes.map(shape => stage.findOne(`#${shape.id}`));
        transformerRef.current.nodes(selectedNodes);  // Set transformer to all selected shapes
        transformerRef.current.getLayer().batchDraw();  // Redraw transformer
    }
}, [selectedShapes]);  // Update whenever selected shapes change

  
  useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'r') {
                if (isRulerActive) { // Only open the modal if the ruler mode is active
                    setIsModalOpen(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isRulerActive]);

  
  //console.log( 'update shape after load in canvas', shapes)
  useEffect(() => {
    if (startPoint && endPoint) {
        const dist = calculateDistance(startPoint, endPoint, scaleType, unit);
        setDistance(dist);
    }
}, [startPoint, endPoint, scaleType, unit]);


useEffect(() => {
  const handleDoubleClick = (e) => {
      if (isRulerActive && startPoint) {
          const stage = e.target.getStage();
          const pointerPosition = stage.getPointerPosition();

          const adjustedX = pointerPosition.x - stage.width() / 2;
          const adjustedY = pointerPosition.y - stage.height() / 2;
          setEndPoint({ x: adjustedX, y: adjustedY });

          const distance = calculateDistance(startPoint, { x: adjustedX, y: adjustedY }, scaleType, unit);
          setDistance(distance);

          setShapes(prevShapes => [
              ...prevShapes,
              {
                  id: uuidv4(),
                  start: startPoint,
                  end: { x: adjustedX, y: adjustedY },
                  distance: `${distance} ${unit}`,
                  unit: unit,
                  color: selectedLayer?.color || 'red',
              }
          ]);

          setLineFinalized(true);
          setIsDrawing(false);
      }
  };

  const stage = stageRef.current;
  stage.on('dblclick', handleDoubleClick);

  return () => {
      stage.off('dblclick', handleDoubleClick);
  };
}, [isRulerActive, startPoint, scaleType, unit]);



useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isRulerActive) {
      deactivateRuler();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  // Cleanup the event listener on component unmount
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [isRulerActive]);



  useEffect(() => {
    //console.log('shapes in canvas update yo yo honey singh', shapes, directoryHandle, layers)
    const savedShapes = JSON.parse(localStorage.getItem(`shapes_${projectName}`));
    if (savedShapes) {
      setShapes(savedShapes);
    } else {
      setShapes([]);
    }
  }, [projectName]);
  useEffect(() => {
    if (layerRef.current) {
        layerRef.current.batchDraw(); // Ensure the layer is re-rendered whenever shapes change
    }
}, [shapes]);

  
  // Save shapes to localStorage whenever they change
  useEffect(() => {
    if (projectName) {
      localStorage.setItem(`shapes_${projectName}`, JSON.stringify(shapes));
    }
  }, [shapes, projectName]);
  
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
                    visibility:shape.visibility,
                };
            }
            return shape;
        });
        setShapes(updatedShapes);
    }
  }, [selectedLayer]);


  useEffect(() => {
    if (transformerRef.current) {
      const nodes = selectedShapes.map(shape => layerRef.current.findOne(`#${shape.id}`)).filter(node => node !== undefined);
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedShapes, shapes]);


  useEffect(() => {
    //console.log('layer info',allLayers, layers)
    if (layerRef.current) {
        layerRef.current.batchDraw(); // Redraws the layer when shapes are updated
    }
  }, [shapes]);
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.batchDraw(); // Redraw the layer when shapes are updated
    }
  }, [shapes]);
  

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        undo(shapes, setShapes); // Undo action
      }
      if (e.ctrlKey && e.key === 'y') {
        redo(shapes, setShapes); // Redo action
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
  
      handleKeyboardCopyPaste(e, selectedShapes, shapes, setShapes, transformerRef, stageRef, lastClickPosition);
      handleDragAndDrop(e, selectedShapes, setSelectedShapes, stageRef, shapes, setShapes, setIsDraggingMode);
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shapes, selectedShapes]);
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key.toLowerCase() === 'm') {
            setIsDraggingMode(true);  // Activate dragging mode when 'M' is pressed
            console.log("Dragging mode activated");
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, []);


  

  

  
  useEffect(() => {
    if (selectedShapes>0) {
      getShapeProperties (selectedShapes)
    }
  }, [selectedShapes]);


  const addInstance = (instanceData) => {
    const instanceShapes = instanceData.layout_data.cells[0].properties;
    const instanceId = uuidv4();
    const instance = {
        id: instanceId,
        type: 'instance',
        children: instanceShapes.map(shape => ({
            ...shape,
            id: uuidv4(), // Generate new IDs for each shape in the instance
            parentId: instanceId // Track the parent instance
        }))
    };
    setShapes(prevShapes => [...prevShapes, ...instance.children]);
    addDesignToHierarchy(instance); // Assuming you have a method to add this to the hierarchy
};


//  useEffect(() => {
//         const updatedShapes = updateVisibilityBasedOnHierarchy(shapes, firstInput, secondInput);
//          setShapes(updatedShapes);
//      }, [firstInput, secondInput, shapes, setShapes]);
    

const setInstanceVisibility = (firstLevel, secondLevel) => {
  const updatedShapes = updateVisibilityBasedOnHierarchy(shapes, firstLevel, secondLevel);
  setShapes(updatedShapes);
};


const handleShapeUpdate1 = (updatedShape) => {
  saveUndoState(shapes);  // Save the current state before updating shapes

  setShapes((prevShapes) =>
      prevShapes.map((shape) =>
          shape.id === updatedShape.id ? { ...shape, ...updatedShape } : shape
      )
  );
};



  
  

  useImperativeHandle(ref, () => ({
    activateRectangleTool() {
      setRectangleToolActive(true);
      addEscapeListener(deactivateRectangleTool, 'Escape');
    },
    activateRulerTool() {
      setIsRulerActive(true);
      setLine(null);
      setStartPoint(null);
      setEndPoint(null);
      setDistance(null);
      
  },
  setInstanceVisibility,

  updateShape(updatedShape) {
    console.log('Updating shape on canvas:', updatedShape);

    const shapeNode = stageRef.current.findOne(`#${updatedShape.id}`);
    if (!shapeNode) {
        console.error('Shape node not found.');
        return;
    }

    // Temporarily detach the transformer
    if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer().batchDraw(); // Redraw layer to reflect the removal
    }

    // Update the shape's properties directly
    shapeNode.position({ x: updatedShape.x, y: updatedShape.y });
    shapeNode.size({ width: updatedShape.width, height: updatedShape.height });
    shapeNode.rotation(updatedShape.rotation || 0); // Update rotation if needed

    // Reattach the transformer to the updated shape after a small delay
    setTimeout(() => {
        if (transformerRef.current) {
            transformerRef.current.nodes([shapeNode]);
            transformerRef.current.getLayer().batchDraw(); // Redraw layer to apply changes
        }
    }, 0); // Use setTimeout to ensure the DOM updates are applied first
},
  setSelectedShape: (shape) => {
    console.log('Shape Selected:', shape);
    setSelectedShape(shape);
  },
  deactivateRulerTool() {
    setIsRulerActive(false);
    setLine(null);
    setStartPoint(null);
    setEndPoint(null);
    setDistance(null);
},
handleDeleteShapesInternal() {
  // Ensure you're passing the necessary parameters, including labels and setLabels
  deleteSelectedShapes(shapes, selectedShapes, setShapes, setSelectedShapes, );
  
  if (transformerRef.current && transformerRef.current.nodes()) {
    transformerRef.current.nodes([]); // Clear the transformer selection
  }
},

    handleCopyShapesInternal() {
      copySelectedShapes(shapes, selectedShapes, setCopiedShapes);
    },
    handlePastShapesInternal() {
      if (copiedShapes.length > 0) {
        console.log("copyed shapes ####################################",copiedShapes)
        const pointerPosition = stageRef.current.getRelativePointerPosition();
        const stage=stageRef.current // Get the current pointer position
        pasteCopiedShapes(copiedShapes, shapes, setShapes, lastClickPosition, stageRef.current); // Call the paste function
      }
    },


    saveShapes() {
      console.log("Attempting to save shapes...");
      console.log("Project Name:", projectName);
      console.log("Directory Handle:", directoryHandle);
      console.log(shapes)
      if (directoryHandle && projectName) {
          // Assuming you have instances and labels stored in your component's state or props
          const instances = []; // Replace with your actual instances array
          const labels = []; // Replace with your actual labels array
  
          saveShapesToFile(shapes, projectName, directoryHandle);
      } else {
          console.error('Directory handle or project name is missing.');
      }
  },
  addInstance,


  activateLabelTool() {
    setTextMode(true);
  },
  
  
  loadShapes(event) {
    // Log layers to verify
    
    loadShapesFromFile(event, setShapes, layers, this.setLayerVisibility, setTopcellname, setMissingLayers);
    
},
loadDesign(fileData) {
  const { file, x, y } = fileData;

  console.log('Layers before passing to loadDesignWithCoordinates:', layers);  // Debug log

  if (file instanceof Blob) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const layoutData = JSON.parse(e.target.result);

      console.log('load design canvas', layoutData);
      console.log('Layers:', layers);
      console.log('X Coordinate:', x);
      console.log('Y Coordinate:', y);

      loadDesignWithCoordinates(
        { file, layoutData }, 
        setShapes, 
        layers, // Pass layers here 
        x, 
        y, setTopcellname
      );
    };

    reader.readAsText(file);
  } else {
    console.error('Invalid file type');
  }
},
    getSelectedShapes() {
      return selectedShapes.length > 0 ? selectedShapes[0] : null;
    },
    
    activateCrop() {
      setIsCropping(true);
      handleCrop(stageRef, shapes, setShapes, setIsCropping);
      addEscapeListener(deactivateCropTool, 'c');
    },
    setLayerVisibility(layerNumber, datatypeNumber, visibility) {
      console.log(`Setting visibility for Layer ${layerNumber} and Datatype ${datatypeNumber} to ${visibility}`);
      
      const updatedShapes = shapes.map(shape => {
        if (shape.layerId === layerNumber && shape.datatypeId === datatypeNumber) {
          console.log(`Shape ${shape.id} visibility changed from ${shape.visible} to ${visibility}`);
          return { ...shape, visible: visibility };  // Ensure visibility is updated correctly
        }
        return shape;
      });
    
      setShapes(updatedShapes);  // Update the state with the new shapes array
      console.log("Updated shapes:", updatedShapes);
    },
    
    

  setAllLayersVisibility(isVisible) {
    const updatedShapes = shapes.map(shape => ({
      ...shape,
      visible: isVisible
    }));
    setShapes(updatedShapes);
  },
  updateShape: (updatedShape) => {
    
    setShapes(prevShapes =>
      prevShapes.map(shape =>
        shape.id === updatedShape.id ? { ...shape, ...updatedShape } : shape
      )
    );
  },
    // lockShapesInLayer(layer) {
    //     const updatedShapes = shapes.map(shape => (shape.layerId === layer.layer_number ? { ...shape, draggable: false } : shape));
    //     setShapes(updatedShapes);
    // },
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
    activateUndo ()  {
      saveUndoState(shapes);  // Save the current state before performing undo
      undo(shapes, setShapes);  // Call the undo function
  },
  
   activateRedo  ()  {
     // saveRedoState(shapes);  // Save the current state before performing redo
      redo(shapes, setShapes);  // Call the redo function
  },
    unlockShapesInLayer(layer) {
      const updatedShapes = shapes.map((shape) =>
        shape.layerId === layer.layer_number ? { ...shape, draggable: true } : shape
      );
      setShapes(updatedShapes);
    },
    async getShapes() {
      return shapes;
  },
  getShapes1(projectName) {
    return convertShapesToLayoutData(shapes, projectName);
},
  async getDirectoryHandle() {
    return directoryHandle;
},
undo: handleUndo,
        redo: handleRedo,
    activateFitToScreen() {
        fitToScreen(stageRef, layerRef, shapes);
    },
  
    getSelectedShapes() {
      return selectedShapes.length > 0 ? selectedShapes[0] : null;
    },
    flipSelectedShapesX() {
      flipX(selectedShapes, setShapes);  // Use the flipX function from the operations file
  },
    flipSelectedShapesY() {
        flipY(selectedShapes, setShapes);  // Use the flipY function from the operations file
    },
    getSelectedShapeProperties() {
      // Example: Returning the properties of the selected shape(s)
      const selectedShapes = stageRef.current.find('.selected'); // Adjust this logic based on how you manage selected shapes
      return selectedShapes.map(shape => ({
          id: shape.id(),
          x: shape.x(),
          y: shape.y(),
          width: shape.width(),
          height: shape.height(),
          // Add more properties if needed
      }));
  },
  activateBoundingBoxTool() {
    // Calling the imported function and passing the necessary arguments
    activateBoundingBoxTool(selectedShapes, setShapes, addDesignToHierarchy, stageRef, layerRef);
  
  },
  openGroupPopup() {
    setIsGroupPopupOpen(true);
  },
    
   
  }));


  const handleUndo = () => {
    console.log('Undo action triggered');
    undo(shapes, setShapes);
};

const handleRedo = () => {
    console.log('Redo action triggered');
    redo(shapes, setShapes);
};

  const calculateBoundingBox = (selectedShapes) => {
    const positions = selectedShapes.map(shape => ({
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
    }));

    const minX = Math.min(...positions.map(pos => pos.x));
    const minY = Math.min(...positions.map(pos => pos.y));
    const maxX = Math.max(...positions.map(pos => pos.x + pos.width));
    const maxY = Math.max(...positions.map(pos => pos.y + pos.height));

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};






  

  const deactivateRuler = () => {
      setIsRulerActive(false);
      setLine(null);
      setStartPoint(null);
      setEndPoint(null);
      setDistance(null);
  };

  const handleCreateGroup = (instanceName) => {
    if (selectedShapes.length > 0) {
      const group = {
        id: `group-${instanceName}`,
        name: instanceName,
        type: 'Group',
        children: selectedShapes.map(shape => ({ ...shape })),
      };
      setShapes([...shapes, group]);
      setSelectedShapes([]); // Clear selection after grouping
    }
  };

  const calculateDistance = (start, end, scaleType, unit) => {
    if (!start || !end) return '';

    let dx = end.x - start.x;
    let dy = end.y - start.y;

    if (scaleType === 'horizontal') dy = 0;
    if (scaleType === 'vertical') dx = 0;

    const distInPixels = Math.sqrt(dx * dx + dy * dy); // Standard distance calculation

    switch (unit) {
        case 'cm':
            return (distInPixels / 37.7952755906).toFixed(2); // Convert pixels to cm
        case 'inch':
            return (distInPixels / 96).toFixed(2); // Convert pixels to inches
        default:
            return distInPixels.toFixed(2); // Return pixels
    }
};




const buildDirectoryPath = async (directoryHandle) => {
  let path = directoryHandle.name;

  // Traverse up the directory tree
  let parentHandle = await directoryHandle.getParent();
  while (parentHandle) {
      path = `${parentHandle.name}/${path}`;
      parentHandle = await parentHandle.getParent();
  }

  return path;
};


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





  const onUpdateLabel = (updatedProperties) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === selectedLabel.id ? { ...shape, ...updatedProperties } : shape
      )
    );
  };


  
  const handleDragEnd = (e, index) => {
    const shape = e.target; // The dragged shape
    const newX = shape.x(); // Get the new X position
    const newY = shape.y(); // Get the new Y position

    // Log to check if drag event is working
    console.log(`Shape dragged. New position: (${newX}, ${newY})`);

    // Update the shapes array with the new position of the dragged shape
    setShapes(prevShapes => {
        const updatedShapes = prevShapes.map((s, i) => {
            if (i === index) {
                return { ...s, x: newX, y: newY }; // Update the position of the dragged shape
            }
            return s; // Return unchanged shapes
        });
        saveUndoState(shapes)
        //saveRedoState(shapes)
        // Optionally save updated shapes to localStorage
        if (projectName) {
            localStorage.setItem(`shapes_${projectName}`, JSON.stringify(updatedShapes));
        }

        return updatedShapes;
    });
};


  

  const handleShapeUpdate = (updatedShape) => {
    if (!stageRef.current) {
        console.error('Stage reference is missing.');
        return;
    }

    const shapeNode = stageRef.current.findOne(`#${updatedShape.id}`);

    if (!shapeNode) {
        console.error('Shape node not found.');
        return;
    }

    // Update the shape's properties directly
    shapeNode.position({ x: updatedShape.x, y: updatedShape.y });
    shapeNode.size({ width: updatedShape.width, height: updatedShape.height });
    shapeNode.rotation(updatedShape.rotation || 0); // If you handle rotation

    // Optionally update the state if necessary
    setShapes((prevShapes) =>
        prevShapes.map((shape) =>
            shape.id === updatedShape.id ? { ...shape, ...updatedShape } : shape
        )
    );

    // Redraw the layer to reflect the changes
    if (layerRef.current) {
        layerRef.current.batchDraw();
    }
};

  
  
  
  const isShapeDraggable = (shape) => {
      const isLayerLocked = lockedLayers[`${shape.layerId}-${shape.datatypeId}`];
      return !rectangleToolActive && !isResizing && !isLayerLocked && !isAllLocked;
    };
    const handleTransformEnd = (e, shapeId) => {
      const node = e.target;
      const newWidth = node.width() * node.scaleX();
      const newHeight = node.height() * node.scaleY();
    
      node.scaleX(1); // Reset scaleX to 1
      node.scaleY(1); // Reset scaleY to 1
    
      const updatedShapes = shapes.map(shape => {
        if (shape.id === shapeId) {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
          };
        }
        return shape;
      });
    
      setShapes(updatedShapes); // Update the shapes in the state
    
      // Directly re-attach the Transformer after the shape has been transformed
      if (transformerRef.current) {
        const shapeNode = stageRef.current.findOne(`#${shapeId}`);
        if (shapeNode) {
          transformerRef.current.nodes([shapeNode]);
          transformerRef.current.getLayer().batchDraw(); // Redraw the layer with the Transformer attached
        }
      }
    };
    
    
  const logShapeProperties = (shape) => {
    if (shape && shape.attrs) {
      console.log("X:", shape.x);
      console.log("Y:", shape.y);
      console.log("Width:", shape.width);
      console.log("Height:", shape.height);
      console.log("Datatype Name:", shape.attrs.datatypeName || "N/A");
      console.log("Layer Name:", shape.attrs.layerName || "N/A");
    } else {
      console.log("Shape or attrs is not defined.");
    }
    
  };



  const saveCanvas = () => {
    const dataURL = stageRef.current.toDataURL();
    console.log('Canvas saved:', dataURL);
    // You can implement further actions here, such as sending the dataURL to a server or saving it locally.
  };
  
    
    
  




// Recursive function to calculate the maximum depth of instances
const calculateInstanceDepth = (shape) => {
  if (!shape || typeof shape !== 'object' || !shape.type) {
      return 0; // Base case: If shape is null or not an object, return 0
  }

  let maxDepth = 0;

  if (shape.type === 'Instance') {
      // If it's an instance, we start with depth 1
      maxDepth = 1;
  }

  // If the shape has children, we recursively calculate the depth of each child
  if (shape.children && Array.isArray(shape.children)) {
      shape.children.forEach((child) => {
          if (child && child.type === 'Group' && Array.isArray(child.children)) {
              // If it's a group, calculate the depth of its children
              child.children.forEach((groupChild) => {
                  const childDepth = calculateInstanceDepth(groupChild);
                  maxDepth = Math.max(maxDepth, 1 + childDepth); // Increment depth for the current level
              });
          } else {
              // If it's a direct child, calculate the depth for the child
              const childDepth = calculateInstanceDepth(child);
              maxDepth = Math.max(maxDepth, 1 + childDepth); // Increment depth for the current level
          }
      });
  }

  return maxDepth;
};

// Function to find the top-level instance with the maximum depth
const findTopLevelInstanceWithMaxDepth = (shapes) => {
  let maxDepthInstance = null;
  let maxDepth = 0;

  shapes.forEach((shape) => {
      if (!shape || typeof shape !== 'object') return;

      const currentDepth = calculateInstanceDepth(shape); // Calculate the depth for the current instance
      if (currentDepth > maxDepth) {
          maxDepth = currentDepth;
          maxDepthInstance = shape; // Track the instance with the maximum depth
      }
  });

  return { maxDepthInstance, maxDepth };
};

// Function to calculate and log the depth of the hierarchy
// const calculateMaxHierarchyDepth = (shapesArray) => {
//   const result = findTopLevelInstanceWithMaxDepth(shapesArray);
//   console.log('Instance with the deepest hierarchy:', result.maxDepthInstance?.name || 'None');
//   console.log('Max hierarchy depth:', result.maxDepth);
// };

// Call this function with your dynamic shapes array
// calculateMaxHierarchyDepth(shapes);



//console.log('selected shapes ' , selectedShapes)
const renderShapeOrInstance = (shape, parentX = 0, parentY = 0) => {
  // Calculate the absolute position of the shape by adding parent's X and Y to its own position
  
  const shapeX = parentX + (shape.x || 0);
  const shapeY = parentY + (shape.y || 0);
  // If the parent shape is not visible, the children should also be hidden
  const isVisible = shape.visible !== undefined ? shape.visible : true;
  const isLayerLocked = lockedLayers[`${shape.layerId}-${shape.datatypeId}`];
  //const mirrorX = shape.mirror_x ? -1 : 1;

  // If the shape is a Group, recursively render its children
  if (shape.type === 'Group') {
    //const rotationInDegrees = radToDeg(shape.rotation || 0);
    //const mirrorX = shape.mirror_x ? -1 : 1;
    return (
      <Group
        key={shape.id}
        id={shape.id}
        x={shape.x}
        y={shape.y}
        draggable={!rectangleToolActive && !isAllLocked && !shape.locked}
        onClick={(e) => shape.locked ? null : onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}
        onDragEnd={(e) => handleDragEnd(e, shape)}
        //rotation={rotation}
        visible={shape.visible}
        onDragMove={isDraggingMode}
        
       // scaleX={mirrorX}
       // offsetX={shape.width / 2} // Set the rotation around the center (horizontally)
 // offsetY={shape.height / 2}
      >
        
        {/* Recursively render the group's children */}
        {shape.children.map((child) => renderShapeOrInstance(child, shapeX, shapeY))}
      </Group>
    );
  }

  // Render Label
  if (shape.type === 'Label') {
    return (
      <Text
        key={shape.id}
        id={shape.id}
        x={shape.x-parentX}
        y={shape.y-parentY}
        text={shape.text}
        fontSize={shape.size || 16} // Default font size if missing
        fontFamily="Arial"
        fill={shape.color || 'red'}
        draggable={!isLayerLocked}  // Disable dragging if the layer is locked
        onClick={(e) => !isLayerLocked && onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}  // Disable selection if locked
        rotation={shape.rotation}
        opacity={shape.opacity}
        //onClick={(e) => onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}
        visible={shape.visible}  // Respect visibility flag
      />
    );
  }

  // Render Rectangle or other shapes
  // if (shape.type === 'Rectangle') {
  //   return (
  //     <Rect
  //       key={shape.id}
  //       id={shape.id}
  //       x={shapeX}
  //       y={shapeY}
  //       width={shape.width}
  //       height={shape.height}
  //       fill={shape.color}
  //       //draggable
  //       draggable={!isLayerLocked}  // Disable dragging if the layer is locked
  //       onClick={(e) => !isLayerLocked && onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}  // Disable selection if locked
  //       visible={shape.visible}  // Respect visibility flag
  //     />
  //   );
  // }

  // Render Polygon
  if (shape.type === 'Polygon') {
    if (shape.points && Array.isArray(shape.points)) {
      const adjustedPoints = shape.points.map((point, index) => {
        return index % 2 === 0 ? point - parentX : point - parentY; // Adjust X and Y
      });

      return (
        <Line
          key={shape.id}
          id={shape.id}
          points={adjustedPoints}
          fill={shape.color || 'transparent'}
          stroke={shape.color || 'red'}
          strokeWidth={4}
          closed={true}
          draggable={false}  // Disable dragging if the layer is locked
          onClick={(e) => !isLayerLocked && onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}  // Disable selection if locked
          opacity={shape.opacity}
          
          visible={isVisible}  // Respect visibility flag
        />
      );
    }
    console.error('Points array is missing or not an array for shape:', shape.id);
    return null;
  }

  // Render Instance and its children
  if (shape.type === 'Instance') {
    const instanceX = shapeX; // X position of instance, absolute relative to canvas
    const instanceY = shapeY; // Y position of instance, absolute relative to canvas

    return (
      <React.Fragment key={shape.id}>
        {/* Instance bounding box */}
        <Rect
          id={shape.id}
          x={shape.x + parentX}
          y={shape.y + parentY}
          width={shape.width}
          height={shape.height}
          stroke={shape.stroke}
          strokeWidth={60}
          fill="transparent"
          draggable={true} // Make the group draggable
          onDragEnd={(e) => handleDragEnd(e, shape)}
          onClick={(e) => onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}
          visible={shape.visible}  // Respect visibility flag
        />
        {/* Instance name */}
        <Text
          x={instanceX + shape.width / 2 - (shape.name.length * 4)}
          y={instanceY + shape.height / 2 - 8}
          text={shape.name}
          fontSize={36}
          fill="white"
          align="center"
          visible={shape.nameVisible && isVisible}  // Ensure name visibility respects the parent instance visibility
        />
        {/* Recursively render children */}
        {shape.children.map((child) => renderShapeOrInstance(child, instanceX, instanceY))}

        {/* Transformer logic */}
        {selectedShapes.includes(shape) && (
          <Transformer
            ref={transformerRef}
            nodes={(() => {
              const node = layerRef.current?.findOne(`#${shape.id}`);
              return node ? [node] : [];
            })()}
            resizeEnabled={true}
            rotateEnabled={true}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
          />
        )}
      </React.Fragment>
    );
  }

  return null;
};

const cutShapeWithClip = (shape, cutRect) => {
  const newShape = { ...shape };

  // Define a clip function based on the cutting rectangle
  newShape.clipFunc = function (ctx) {
    ctx.rect(cutRect.x - this.x(), cutRect.y - this.y(), cutRect.width, cutRect.height);
  };

  return newShape;
};


const onSelectShape = (shape, isCtrlPressed) => {
  if (shape && shape.visible) {
      setSelectedShapes((prevSelectedShapes) => {
          console.log("Previous selected shapes: ", prevSelectedShapes);
          console.log("Clicked shape: ", shape);

          if (isCtrlPressed) {
              if (prevSelectedShapes.some(selected => selected.id === shape.id)) {
                  console.log("Deselecting shape: ", shape);
                  return prevSelectedShapes.filter(selected => selected.id !== shape.id);
              } else {
                  console.log("Adding shape to selection: ", shape);
                  return [...prevSelectedShapes, shape];
              }
          } else {
              console.log("Single selection mode for shape: ", shape);
              return [shape];
          }
      });
  }
};
const handleCanvasClick = (e) => {

  const stage = e.target.getStage();
  const pointerPosition = stage.getPointerPosition();
  setLastClickPosition({
    x: pointerPosition.x - stage.width() / 2,
    y: pointerPosition.y - stage.height() / 2,
  });
};



  

  
  

  
  
  

  return (
    <div className="canvas-container" style={{ position: 'relative' }}>
      
      <Stage
        draggable={false}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ cursor: isRulerActive ? 'crosshair' : 'default' }} 
        onMouseDown={(e) =>{handleCanvasClick(e);  handleMouseDown(e, setIsDrawing, setNewShape, selectedLayer, setSelectedShapes, shapes, selectedShapes, rectangleToolActive, transformerRef,lockedLayers,isAllLocked,isRulerActive, setStartPoint,startPoint, setEndPoint,setLineFinalized, lineFinalized,scaleType, unit,onSelectShape,setSelectionRect, 
          setIsSelecting, isDraggingMode, isCutting, setCutStartPoint, setCutRect, cutRect , cutShapeWithClip, setShapes)}}
        onMouseMove={(e) => handleMouseMove(e, isDrawing, newShape, setNewShape, isDraggingMode, selectedShapes, stageRef, lockedLayers, isAllLocked,isRulerActive, startPoint, setEndPoint,lineFinalized, setDistance,  scaleType,
          unit,selectionRect,  // Pass the selection rectangle state
          setSelectionRect,setMousePosition, isSelecting, isCutting, cutStartPoint, setCutRect)}
        onMouseUp={() => handleMouseUp( isDrawing, newShape, setShapes, setNewShape, setIsDrawing, isAllLocked, isRulerActive, startPoint, endPoint, deactivateRuler, calculateDistance, setLine, unit, scaleType, setStartPoint, setEndPoint, setLineFinalized, setDistance,selectionRect,  // Pass the selection rectangle state
          setSelectionRect,  // Pass the state handler for clearing selection rectangle
          setIsSelecting,  // Pass the state handler for selection mode
          shapes,
          setSelectedShapes, isDraggingMode,isCutting, cutRect)}
        ref={stageRef}
        
      onWheel={(e) => handleZoom(e, stageRef, setScale, setPosition)}
      scaleX={scale} // Use scale from state
  scaleY={scale} // Apply scaleY as well
  x={position.x} // Apply position from state
  y={position.y} // Apply position from state
        setLastDistance={distance +' '+unit}
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
            id="xAxisLine"
            points={[-window.innerWidth * 100, 0, window.innerWidth * 100, 0]} // Line from far left to far right across the center
            stroke="white"
            strokeWidth={1}
          />
          {/* Draw vertical line */}
          <Line
            id="yAxisLine"
            points={[0, -window.innerHeight * 100, 0, window.innerHeight * 100]} // Line from top to bottom across the center
            stroke="white"
            strokeWidth={1}
          />
          {startPoint && endPoint && !lineFinalized && (
            <>
                <Line
                    id='ruler'
                    points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
                    stroke="red"
                    
                    strokeWidth={2 / stageRef.current.scaleX()}
                    perfectDrawEnabled={false}
                />
                <Text
                    x={(startPoint.x + endPoint.x) / 2}
                    y={(startPoint.y + endPoint.y) / 2 - 20}
                    text={distance + ' '+unit}
                    fontSize={16/ stageRef.current.scaleX()}
                    fill="white"
                />
            </>
        )}

        {/* Render all finalized lines with their distances */}
        {shapes.map((shape, index) => {
            if (!shape || !shape.start || !shape.end) {
              //console.error("Invalid shape encountered:", shape);
              return null;
            }
  
            return (
              <React.Fragment key={index}>
                <Line
                  points={[shape.start.x, shape.start.y, shape.end.x, shape.end.y]}
                  stroke={shape.color}
                  strokeWidth={2}
                />
                <Text
                  x={(shape.start.x + shape.end.x) / 2}
                  y={(shape.start.y + shape.end.y) / 2 - 20}
                  text={shape.distance}
                  fontSize={16}
                  fill="white"
                />
              </React.Fragment>
            );
          })}


{cutRect && isCutting && (
  <Rect
    x={cutRect.x}
    y={cutRect.y}
    width={cutRect.width}
    height={cutRect.height}
    fill="transparent"
    stroke="blue"
    strokeWidth={2}
    dash={[10, 10]} // Dashed outline for visual feedback
  />
)}



{selectionRect   && (
    <Rect
        x={selectionRect.x}
        y={selectionRect.y}
        width={selectionRect.width}
        height={selectionRect.height}
        fill="transparent"  // Semi-transparent fill
        stroke="white"  
        strokeWidth={2 / stageRef.current.scaleX()}            // Blue border
                 // Dashed outline for clarity
    />
)}



  {shapes.map((shape, index) => {
        const shapeRef = React.createRef();
        const transformerRef = React.createRef();
        const isLayerLocked = lockedLayers[`${shape.layerId}-${shape.datatypeId}`];
        const alllocked= isAllLocked[`${shape.layerid}-${shape.datatypeId}`]
        //console.log("Rendering shape:", shape);
        if (!shape.visible) return null;
        const parentX = 0;
        const parentY = 0;
        
        
        //const isShapeDraggable = !rectangleToolActive && !isResizing && !lockedLayers[`${shape.layerId}-${shape.datatypeId}`];
        return shape.visible && (
          
              <React.Fragment key={shape.id}>
                {renderShapeOrInstance(shape, parentX, parentY)}
                {shape.type === 'Rectangle' && (
        <Rect
          key={shape.id}
          id= {shape.id || `shape_${uuidv4()}`}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.color}
          //draggable={!rectangleToolActive && !isLayerLocked && !isAllLocked } // Prevent dragging when rectangle tool is active
          onClick={(e) => !rectangleToolActive && !isAllLocked && !isLayerLocked && onSelectShape(shape, e.evt.ctrlKey || e.evt.metaKey)}  // Disable selection if locked
          opacity={shape.opacity}
          onDragEnd={(e) => handleDragEnd(e, index)}
          clipFunc={shape.clipFunc}
          visible={shape.visible}
        />
      )}
                




          
                {!isLayerLocked &&selectedShapes.includes(shape) && (
        <Transformer
          ref={transformerRef}
          nodes={(() => {
            const node = layerRef.current.findOne(`#${shape.id}`);
            return node ? [node] : [];
          })()}
          resizeEnabled={true}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
        />
      )}

              </React.Fragment>
            );
          })}
          {newShape && (
            <Rect
              id={newShape.id}
              x={newShape.x}
              y={newShape.y}
              width={newShape.width}
              height={newShape.height}
              fill={newShape.color}
              opacity={newShape.opacity}
              draggable={!rectangleToolActive && !isCropping && !isResizing }
              visible={newShape.visible}
              
            />
          )}

          
        </Layer>
        
      </Stage>

      {/* {isLabelSettingsOpen && (
        <LabelSettings
          selectedLabel={{ fontSize: 16, fontFamily: 'Arial', color: '#000000' }}
          onUpdateLabel={() => {}}
          onClose={() => setIsLabelSettingsOpen(false)}  // Close the modal
        />
      )} */}
      <RulerModal
                isOpen={isModalOpen}
                onClose={closeModal}
                scaleType={scaleType}
                setScaleType={setScaleType}
                unit={unit}
                setUnit={setUnit}
            />
      // When triggered by a file input
      <input
      type="number"
      placeholder="X Coordinate"
      value={xCoord}
      onChange={(e) => setXCoord(parseFloat(e.target.value))}
    />
    <input
      type="number"
      placeholder="Y Coordinate"
      value={yCoord}
      onChange={(e) => setYCoord(parseFloat(e.target.value))}
    />

    {/* File input for loading the design */}
    <input
  type="file"
  onChange={(e) => {
    const file = e.target.files[0];
    loadDesignWithCoordinates({ file, x: xCoord, y: yCoord }, (newShapes) => {
      // Append new shapes to the existing ones
      console.log("Existing shapes before appending:", shapes);  // Debug log
      console.log("New shapes to append:", newShapes);  // Debug log
      setShapes((prevShapes) => {
        const combinedShapes = [...prevShapes, ...newShapes];
        console.log("Combined shapes after appending:", combinedShapes);  // Debug log
        return combinedShapes;
      });
    }, allLayers, xCoord, yCoord); // Pass dynamic X and Y coordinates here
  }}
/>

{isGroupPopupOpen && (
        <GroupPopup 
          onClose={() => setIsGroupPopupOpen(false)} 
          onCreateGroup={handleCreateGroup} 
        />
      )}


      
      <input
        type="file"
        id="fileInput"
        onChange={(e) => loadShapesFromFile(e, setShapes, allLayers)}
        accept=".json"
        style={{ display: 'none' }}
      />
      <div style={{ position: 'absolute', bottom: 40, left: -40, color: 'white', backgroundColor: 'black', padding: '5px', borderRadius: '5px' }}>
                X: {mousePosition.x.toFixed(2)}, Y: {-mousePosition.y.toFixed(2)}
            </div>
      
    </div>
  );
});

export default CanvasComponent;