import React, { useState, useRef, useEffect, useCallback } from 'react';
import CanvasComponent from './components/canvasComponent/CanvasComponent';
import CanvasToolbarComponent from './components/canvas-toolbarComponent/CanvasToolbarComponent';
import SidebarComponent from './components/sidebarComponent/SidebarComponent';
import ToolbarComponent from './components/toolbarComponent/ToolbarComponent';
//import DesignPopup from './components/canvasComponent/operations/DesignPopup';
import SignIn from './LoginForm';
import { openDB } from 'idb'; 
import ShapeProperties from './components/sidebarComponent/ShapeProperties'
import DesignPopup from './components/DesignPopup';
import LoginForm from './LoginForm';
import { handleDirectorySelect as selectDirectory, loadDirectoryInfo } from './components/directoryManager';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import AddMissingLayersPopup from './components/sidebarComponent/AddMissingLayersPopup';
import { updateVisibilityBasedOnHierarchy } from './components/canvasComponent/operations/updateHierarchyVisibility';
import LoginPopup from './LoginPopup';





const App = () => {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [newLayer, setNewLayer] = useState({
    layer_number: '',
    datatype_number: '',
    layer_name: '',
    datatype_name: '',
    color: '#000000',
    boundaryColor: '#000000',
    pattern: { type: 'empty_fill', opacity: 0.5 },
    pixelate: 0,
    contrast: 0
});
  
  const [layerVisibility, setLayerVisibility] = useState({});
  const [layers, setLayers] = useState([]);
  const [lockedLayers, setLockedLayers] = useState({
    'layerNumber-datatypeNumber': true/false, // Example: '1-1': true
  });
  
  const [isCropping, setIsCropping] = useState(false);
  const [shapes, setShapes] = useState([]); 
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [groupedShapes, setGroupedShapes] = useState([]);
  const [isAllLocked, setIsAllLocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(true);
  
  
  const [activeTab, setActiveTab] = useState('layermap');
  const [selectedShape, setSelectedShape] = useState(null);
  //const [projectName, setProjectName] = useState(localStorage.getItem('projectName') || '');
  const [projectName, setProjectName] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);
  
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [needsRestore, setNeedsRestore] = useState(true);
  const [designs, setDesigns] = useState([]);
   // This should be the state where your canvas shapes are stored
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [firstInput, setFirstInput] = useState(0);
  const [secondInput, setSecondInput] = useState(1);
  const [labels, setLabels] = useState([]);
  const [topcellname, setTopcellname] = useState(null);
  const [isMissingLayersPopupOpen, setIsMissingLayersPopupOpen] = useState(false); // For missing layers popup
  const [missingLayers, setMissingLayers] = useState([]); // Store missing layers here
  const [triggerSave, setTriggerSave] = useState(false);
  const [authState, setAuthState] = useState(false);

  
  
  
  const stageRef = useRef(null);

  const layerRef= useRef(null);

  
  

  const canvasRef = useRef(null);
  
  const shapePropertiesRef = useRef(null);
  
  




  


  const handleDirectorySelect = async () => {
    try {
        const directoryHandle = await window.showDirectoryPicker();
        console.log("Selected Directory Name:", directoryHandle.name);

        // Example: Reading a file within the selected directory
        for await (const [name, handle] of directoryHandle) {
            if (handle.kind === 'file') {
                const file = await handle.getFile();
                console.log(`Found file: ${file.name}`);
            }
        }

        setDirectoryHandle(directoryHandle); // Set the handle to use later
        setSelectedDirectory(directoryHandle.name); // Set the directory name (not full path)
    } catch (error) {
        console.error('Error selecting directory:', error);
    }
};

const handleCloseLoginPopup = (token) => {
  if (token) {
    localStorage.setItem('access_token', token); // Store token in localStorage
    setIsAuthenticated(true);
    setIsLoginPopupOpen(false); // Close login popup
    fetchLayers();
  }
};

// Check authentication status on component mount
useEffect(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    setIsAuthenticated(true);
    setIsLoginPopupOpen(false);
  } else {
    setIsAuthenticated(false);
    setIsLoginPopupOpen(true);
  }
}, []);
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch('http://54.224.177.87/auth/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.authenticated) {
        setIsAuthenticated(true); // User is authenticated
        setIsLoginPopupOpen(false); // Close login popup
      } else {
        setIsLoginPopupOpen(true); // Show login popup if not authenticated
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsLoginPopupOpen(true); // Default to showing login popup on error
    }
  };
  checkAuth();
}, []);

useEffect(() => {
  //console.log(shapes)
  if (layerRef.current) {
      layerRef.current.batchDraw();
  }
}, [shapes]);


useEffect(() => {
  if (missingLayers.length > 0) {
    setIsMissingLayersPopupOpen(true); // Open popup when there are missing layers
  }
}, [missingLayers]);

useEffect(() => {
  updateInstanceVisibility(firstInput, secondInput);
}, [firstInput, secondInput]);


useEffect(() => {
  if (stageRef.current && layerRef.current) {
      layerRef.current.batchDraw();  // Ensure the canvas redraws when inputs change
  }
}, [firstInput, secondInput]);







  const handleSetSelectedShape = (shape) => {
    if (shape && shape.id) {
      //console.log("Setting selected shape in App:", shape); // Log the shape
      setSelectedShape(shape);
    } else {
      //console.error("Invalid shape encountered in handleSetSelectedShape:", shape);
    }
  };
  

  // useEffect(() => {
    
  //   console.log('selected shapes in app js' , layers)
  //   localStorage.clear();
  //   //setMissingLayers([]);

  //   const fetchLayers = async () => {
  //     try {
  //       const token = localStorage.getItem('access_token');
  //       const response = await fetch('http://127.0.0.1:5000/layers/user/layers', {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`,
  //         },
  //       });
  //       const data = await response.json();
  //       console.log("*******************************************",data)
  //       if (data && data.layers) {
  //         setLayers(data.layers); // Update the state with fetched layers
  //       } else {
  //         console.warn('No layers found');
  //       }
  //     } catch (error) {
  //       console.error('Error loading layers:', error);
  //     }
  //   };
    
    

  //   fetchLayers();
  // }, []);

  useEffect(() => {
    console.log("missing layer added new layer succesfully",newLayer)
    console.log('Layers state updated:', layers);
  }, [layers]);
  useEffect(() => {
    
    console.log('layer in app.js', layers)
    console.log("Directory Handle Updated:", directoryHandle);
}, [directoryHandle]);
useEffect(() => {
  if (directoryHandle) {
      loadDesignFiles(directoryHandle);
  }
}, [directoryHandle]);


useEffect(() => {
  const restoreDirectoryInfo = () => {
      const directoryInfo = loadDirectoryInfo();
      if (directoryInfo) {
          setSavedDesigns(directoryInfo.files);  // Load saved files into the dropdown
      }
  };
  restoreDirectoryInfo();
}, []);
  


  useEffect(() => {
    console.log("Layers and selectedShape:", layers, selectedShape);
    if (layers.length > 0 && selectedShape) {
      const { layerName, datatypeName } = getLayerAndDatatypeNames(selectedShape.layerId, selectedShape.datatypeId);
      //console.log("Layer and Datatype names in App.js:", layerName, datatypeName);
    }
  }, [layers, selectedShape]);

  useEffect(() => {
    if (canvasRef.current) {
      const selectedShape = canvasRef.current.getSelectedShapes();
      setSelectedShapes(selectedShape ? [selectedShape] : []);  // Ensure it's an array
    }
  }, [shapes, selectedLayer]);
  useEffect(() => {
    const saveBeforeUnload = async () => {
        await handleSaveShapes();
    };

    window.addEventListener('beforeunload', saveBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', saveBeforeUnload);
    };
}, [shapes, projectName]); // Trigger the effect whenever shapes or projectName changes


useEffect(() => {
  const restoreDirectoryInfo = () => {
    const directoryInfo = loadDirectoryInfo();
    if (directoryInfo) {
      setSavedDesigns(directoryInfo.files);
    }
  };
  restoreDirectoryInfo();
}, []);

useEffect(() => {
  if (directoryHandle) {
    loadDesignFiles(directoryHandle);
  }
}, [directoryHandle]);


const fetchLayers = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://54.224.177.87/layers/user/layers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add token to request headers
      },
    });
    const data = await response.json();
    console.log("asdfghjkjhgfdsdfghjkjhgfdsdfghjkjhgfdsdfghj", data)
    if (data && data.layers) {
      setLayers(data.layers); // Update state with fetched layers
    } else {
      console.warn('No layers found');
    }
  } catch (error) {
    console.error('Error loading layers:', error);
  }
};

const saveLayersToBackend = async (layersToSave) => {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch('http://54.224.177.87/layers/user/layers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ layers: layersToSave })
  });
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data.message);
  } catch (error) {
      console.error('Error saving layers:', error);
  }
};


useEffect(() => {
  if (triggerSave) {
    saveLayersToBackend(layers); // Save when trigger is true
    setTriggerSave(false); // Reset the trigger
  }
}, [triggerSave, layers]); 



const handleAddMissingLayers = (newLayers) => {
  setLayers((prevLayers) => [...prevLayers, ...newLayers]);

  // Optionally update shapes with the new layer information
  const updatedShapes = shapes.map((shape) => {
    const matchingLayer = newLayers.find(
      (layer) => layer.layer_number === shape.layerId && layer.datatype_number === shape.datatypeId
    );
    if (matchingLayer) {
      return { ...shape, color: matchingLayer.color };
    }
    return shape;
  });
  setShapes(updatedShapes);
};

  

const syncHierarchyWithDropdown = (savedDesigns) => {
  const updatedHierarchy = savedDesigns.map(name => ({
      id: uuidv4(),
      name: name,
      children: []  // Initially, no children
  }));
  setDesigns(updatedHierarchy);  // Update the designs in the hierarchy
};


const loadDesignFiles = async (directory) => {
  const files = [];
  for await (const entry of directory.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json')|| entry.name.endsWith('.gds')) {
          files.push(entry.name);
      }
  }
  setSavedDesigns(files); // Populate dropdown with the design files
  //syncHierarchyWithDropdown(files); // Sync hierarchy with dropdown
};


const buildDirectoryPath = async (directoryHandle) => {
  let path = directoryHandle.name;

  let parentHandle = await directoryHandle.getParent();
  while (parentHandle) {
      path = `${parentHandle.name}/${path}`;
      parentHandle = await parentHandle.getParent();
  }

  return path;
};




  
const handleProjectNameChange = async (name) => {
  setProjectName(name);

  if (directoryHandle && name) {
      try {
          let fileHandle;
          
          // Check if it's a GDS file
          if (name.endsWith('.gds')) {
              // Get the GDS file handle from the directory
              fileHandle = await directoryHandle.getFileHandle(name);
              const file = await fileHandle.getFile();
              
              const formData = new FormData();
              formData.append("file", file);
              
              // Send the file to the backend for conversion
              const response = await fetch('http://54.224.177.87/convert-gds-to-json', {
                  method: 'POST',
                  body: formData,
              });

              const result = await response.json();

              if (response.ok) {
                  // Load the converted JSON into the canvas
                  canvasRef.current.loadShapes({ target: { files: [new File([JSON.stringify(result.json_data)], 'converted.json', { type: 'application/json' })] } });
              } else {
                  alert(`Error converting GDS file: ${result.message}`);
              }

          } else if (name.endsWith('.json')) {
              fileHandle = await directoryHandle.getFileHandle(name);
              const file = await fileHandle.getFile();
              const event = { target: { files: [file] } };
              canvasRef.current.loadShapes(event);
          }
          
      } catch (error) {
          console.error('Error loading shapes from the selected file:', error);
      }
  }
};


const getMissingLayers = (loadedShapes, existingLayers) => {
  const missingLayers = [];
  loadedShapes.forEach((shape) => {
    const layerKey = `${shape.layerId}-${shape.datatypeId}`;
    const layerExists = existingLayers.some(
      (layer) => `${layer.layer_number}-${layer.datatype_number}` === layerKey
    );
    if (!layerExists) {
      missingLayers.push({
        layer_number: shape.layerId,
        datatype_number: shape.datatypeId,
      });
    }
  });
  return missingLayers;
};


// const handleAddMissingLayers = (newLayers) => {
//   setLayers((prevLayers) => [...prevLayers, ...newLayers]);

//   // Optionally update shapes with the new layer information
//   const updatedShapes = shapes.map((shape) => {
//     const matchingLayer = newLayers.find(
//       (layer) => layer.layer_number === shape.layerId && layer.datatype_number === shape.datatypeId
//     );
//     if (matchingLayer) {
//       return { ...shape, color: matchingLayer.color };
//     }
//     return shape;
//   });
//   setShapes(updatedShapes);
// };


const ontoggleShapeVisibility = (instanceId) => {
  setShapes((prevShapes) =>
    prevShapes.map((shape) =>
      shape.id === instanceId
        ? { ...shape, visible: !shape.visible }  // Toggle visibility
        : shape
    )
  );
};




const handleSaveClick = () => {
 

  if (canvasRef.current) {
      canvasRef.current.saveShapes();  // Trigger the saveShapes method
  }
};

  const handleNewDesign = () => {
      setIsPopupOpen(true);
  };

  const handlePopupConfirm = async (name) => {
    if (name) {
        setProjectName(name);  // Set the project name
        setShapes([]);  // Clear current shapes for new design
        
        // Clear all existing designs before adding the new project
        const updatedDesigns = [name]; // Only keep the new design
        setSavedDesigns(updatedDesigns);  // Update the dropdown to only show the new project
        syncHierarchyWithDropdown(updatedDesigns);  // Sync the hierarchy to match the dropdown
    }
    setIsPopupOpen(false);
};

const convertShapesToLayoutData = (shapes, projectName) => {
  return {
      layout_data: {
          units: {
              user_size: 0.001,
              db_size: 1e-09
          },
          cells: [
              {
                  cell_name: projectName,
                  cell_id: projectName,
                  properties: shapes.map(shape => ({
                      id: shape.id || '',
                      type: shape.type || 'rectangle',
                      layer_number: shape.layerId,
                      datatype_number: shape.datatypeId,
                      coordinates: [
                          [shape.x, -(shape.y + shape.height)],  // Corrected to invert y-coordinate
                          [shape.x + shape.width, -(shape.y + shape.height)],  // Corrected to invert y-coordinate
                          [shape.x + shape.width, -shape.y],  // Corrected to invert y-coordinate
                          [shape.x, -shape.y]  // Corrected to invert y-coordinate
                      ]
                  }))
              }
          ]
      }
  };
};



// const handleSaveAndConvertToGDS = async () => {
//   if (!directoryHandle || !projectName) {
//     alert('Error: Directory handle or project name is missing.');
//     return;
//   }

//   try {
//     // Get the layout data from the canvas via getShapes1 method
//     const layoutData = canvasRef.current.getShapes1(projectName);

//     // Use directoryHandle.name as the directory identifier (not the full path)
//     const directoryPath = directoryHandle.name;

//     // Send the layout data and project name to the backend for GDS conversion
//     const response = await fetch('http://127.0.0.1:5000/convert-and-save-gds', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         json_content: JSON.stringify(layoutData),
//         project_name: projectName,
//         directory_path: directoryPath // Pass directory name, the server will resolve the full path
//       }),
//     });

//     if (response.ok) {
//       const result = await response.json();
//       alert('GDS file saved successfully.');
//     } else {
//       const result = await response.json();
//       alert(`Error saving GDS file: ${result.message}`);
//     }
//   } catch (error) {
//     console.error('Error saving and converting JSON to GDS:', error);
//     alert('Error saving GDS file.');
//   }
// };

const handleSaveAndConvertToGDS = async () => {
  if (!projectName || !directoryHandle || !canvasRef.current) {
      alert('Please provide a project name and select a directory.');
      return;
  }

  try {
      const layoutData = canvasRef.current.getShapes1(projectName);
      const directoryPath = directoryHandle.name;

      const response = await fetch('http://54.224.177.87/convert-and-save-gds', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              json_content: JSON.stringify(layoutData),
              project_name: projectName,
              directory_path: directoryPath
          }),
      });

      if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${projectName}.gds`);  // Set the downloaded file name
          document.body.appendChild(link);
          link.click();  // Programmatically click the link to trigger download
          link.parentNode.removeChild(link);
      } else {
          const result = await response.json();
          alert(`Error saving GDS file: ${result.message}`);
      }
  } catch (error) {
      console.error('Error saving and downloading GDS file:', error);
      alert('Error saving and downloading GDS file.');
  }
};



const addDesignToHierarchy = (instanceName, parentInstanceId = null) => {
  const newInstance = {
      id: uuidv4(),
      name: instanceName,
      children: []  // Initially, no children
  };

  setDesigns(prevDesigns => {
      if (parentInstanceId) {
          // Add the new instance as a child of the parent
          return prevDesigns.map(design =>
              design.id === parentInstanceId
                  ? { ...design, children: [...design.children, newInstance] }
                  : design
          );
      } else {
          // Add the new instance to the root level or under the project name
          let projectFound = false;
          const updatedDesigns = prevDesigns.map(design => {
              if (design.name === projectName) {
                  projectFound = true;
                  return { ...design, children: [...design.children, newInstance] };
              }
              return design;
          });

          if (!projectFound && projectName) {
              updatedDesigns.push({
                  id: uuidv4(),
                  name: projectName,
                  children: [newInstance]  // Add the new design under the project
              });
          }

          return updatedDesigns;
      }
  });
};



  
  
  
  
  


  

  

  
  
  

  const handlePopupClose = () => {
    setIsPopupOpen(false);  // Close the popup
  };

  const reloadDirectoryFiles = async (directoryHandle, setSavedDesigns) => {
    try {
        console.log('Starting reloadDirectoryFiles...');
        const files = [];
        for await (const entry of directoryHandle.values()) {
            console.log('Processing entry:', entry.name); // Log each entry
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                files.push(entry.name);
            }
        }
        console.log('Reloaded files:', files); // Check what files are reloaded
        setSavedDesigns(files);
    } catch (error) {
        console.error('Error reloading directory files:', error);
    }
};


  

const handleSaveShapes = async () => {
  try {
      if (!directoryHandle) {
          throw new Error('No directory handle is available. Please select a directory first.');
      }
      if (!projectName) {
          throw new Error('No project name is available. Please provide a project name.');
      }

      if (canvasRef.current) {
          canvasRef.current.saveShapes();  // Trigger the saveShapes method in CanvasComponent
      }
  } catch (error) {
      console.error('Failed to save shapes:', error);
  }
};



console.log('missing layers in app.js ', missingLayers)


  const handleDeleteDesign = async () => {
    if (directoryHandle && projectName) {
      await directoryHandle.removeEntry(projectName);
      setSavedDesigns(savedDesigns.filter(name => name !== projectName));
      setProjectName('');
      setShapes([]);
    }
  };
  const getLayerAndDatatypeNames = (layerNumber, datatypeNumber) => {
    if (!Array.isArray(layers) || layers.length === 0) {
        return {
            layerName: 'Unknown Layer', // Corrected from 'shapes' to 'Unknown Layer'
            datatypeName: 'Unknown Datatype',
        };
    }

    // Find the matching layer by layer_number and datatype_number
    const layer = layers.find(l => l.layer_number === layerNumber && l.datatype_number === datatypeNumber);

    if (layer) {
        return {
            layerName: layer.layer_name || 'Unknown Layer', // Fallback to 'Unknown Layer' if no layer_name found
            datatypeName: layer.datatype_name || 'Unknown Datatype', // Fallback to 'Unknown Datatype' if no datatype_name found
        };
    } else {
        return {
            layerName: 'Unknown Layer',
            datatypeName: 'Unknown Datatype',
        };
    }
};


const handleShapeSelect = (shape) => {
    if (shape) {
        const { layerId, datatypeId } = shape;
        const { layerName, datatypeName } = getLayerAndDatatypeNames(layerId, datatypeId);
        setSelectedShape({ ...shape, layerName, datatypeName });
    } else {
        setSelectedShape(null);
    }
};
  
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
    setIsAllLocked(prev => !prev); // Toggle the isAllLocked state
  };
  

// Recursive function to update lock state for nested shapes
const updateLockStateRecursive = (shapes, isLocked) => {
    return shapes.map((shape) => ({
        ...shape,
        locked: isLocked,
        children: shape.children ? updateLockStateRecursive(shape.children, isLocked) : shape.children,
    }));
};

const updateLockStateRecursive1 = (shapes, isLocked) => {
  return shapes.map((shape) => ({
      ...shape,
      locked: isAllLocked,
      children: shape.children ? updateLockStateRecursive1(shape.children, isAllLocked) : shape.children,
  }));
};

  

  const handleLayerSelected = (layer) => {
    setSelectedLayer(layer);
    console.log('Selected Layer:', layer);
  };


  const updateVisibilityRecursive = (shapes, layerNumber, datatypeNumber, isVisible) => {
    return shapes.map((shape) => {
      // Check if both layerId and datatypeId match the given layerNumber and datatypeNumber
      if (shape.layerId === layerNumber && shape.datatypeId === datatypeNumber) {
        console.log(`Updating visibility for shape: ${shape.id}, new visibility: ${isVisible}`);
        return { ...shape, visible: isVisible };
      }
  
      // Recursively update visibility for children shapes, if any
      if (shape.children && shape.children.length > 0) {
        return {
          ...shape,
          children: updateVisibilityRecursive(shape.children, layerNumber, datatypeNumber, isVisible),
        };
      }
  
      return shape; // Return the unchanged shape if no updates are needed
    });
  };


  const handleToggleLayerVisibility = (layer) => {
    const key = `${layer.layer_number}-${layer.datatype_number}`;
    const newVisibility = !layerVisibility[key];
  
    setLayerVisibility((prev) => ({ ...prev, [key]: newVisibility }));
  
    setShapes((prevShapes) => {
      // Pass both layer_number and datatype_number to ensure correct visibility update
      const updatedShapes = updateVisibilityRecursive(prevShapes, layer.layer_number, layer.datatype_number, newVisibility);
      
      console.log("Toggling visibility for layer:", layer.layer_number, "and datatype:", layer.datatype_number);
  
      // Redraw the layer after visibility update
      if (layerRef.current) {
        setTimeout(() => {
          layerRef.current.batchDraw();  // Force the canvas to redraw
        }, 0);  // Small delay to ensure state updates before redraw
      }
  
      return [...updatedShapes];  // Return a new array to trigger re-render
    });
  };
  
  
  
  

  const handleToggleAllLayersVisibility = (isVisible) => {
    // Toggle visibility for each layer in the visibility state
    const updatedVisibility = layers.reduce((acc, layer) => {
        const key = `${layer.layer_number}-${layer.datatype_number}`;
        acc[key] = isVisible;
        return acc;
    }, {});

    setLayerVisibility(updatedVisibility);

    // Update shapes visibility
    setShapes((prevShapes) => {
        const updatedShapes = prevShapes.map((shape) => {
            return {
                ...shape,
                visible: isVisible,
                children: shape.children ? updateallVisibilityRecursive(shape.children, isVisible) : shape.children,
            };
        });

        // Redraw the layers
        if (layerRef.current) {
            setTimeout(() => {
                layerRef.current.batchDraw();
            }, 0);
        }

        return [...updatedShapes];
    });
};

// Recursive function to update visibility for nested shapes
const updateallVisibilityRecursive = (shapes, isVisible) => {
    return shapes.map((shape) => ({
        ...shape,
        visible: isVisible,
        children: shape.children ? updateVisibilityRecursive(shape.children, isVisible) : shape.children,
    }));
};


  
  const handleToggleLayerLock = (layer) => {
    const key = `${layer.layer_number}-${layer.datatype_number}`;
    const isLocked = lockedLayers[key];
    alert(key)
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
  const handlePastShapes = () => {
    if (canvasRef.current) {
      canvasRef.current.handlePastShapesInternal();
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
  // Inside App.js

  const handleUpdateShape = (updatedShape) => {
    //console.log("handleUpdateShape called with:", updatedShape);

    setShapes((prevShapes) =>
        prevShapes.map((shape) =>
            shape.id === updatedShape.id ? { ...shape, ...updatedShape } : shape
        )
    );
    setSelectedShape(updatedShape);

    if (canvasRef.current && typeof canvasRef.current.updateShape === 'function') {
        canvasRef.current.updateShape(updatedShape);
    } else {
       // console.error("Shape not found on the canvas.");
    }
};


 console.log()




  const handleInstanceClick = () => {
    if (canvasRef.current) {
      canvasRef.current.activateInstanceTool();
    }
  };
  const updateSelectedShape = (shape) => {
    setSelectedShape(shape);
};
const updateInstanceVisibility = (firstValue, secondValue) => {
  if (stageRef.current && layerRef.current) {
      // Update the visibility based on hierarchy
      const updatedShapes = updateVisibilityBasedOnHierarchy(shapes, firstValue, secondValue);
      setShapes(updatedShapes);  // Update the state

      // Redraw the stage or layer to reflect changes
      layerRef.current.batchDraw();  // Or use stageRef.current.draw();
  }
};






const handleLabelClick = () => {
   if (canvasRef.current) {
     canvasRef.current.activateLabelTool();
   }
 };

 

 const addLabelToSidebar = (labelText, position) => {
  const newLabel = {
    id: position.id,
    text: labelText,
    position: { x: position.x, y: position.y }, 
    isVisible: true,
    isLocked: false, // Default properties for labels
  };

  setLabels((prevLabels) => {
    const updatedLabels = [...prevLabels, newLabel];
    return updatedLabels;
  });

  // Add label to shapes array
  setShapes((prevShapes) => {
    const updatedShapes = [
      ...prevShapes,
      {
        id: newLabel.id,
        type: 'Label',
        text: newLabel.text,
        x: newLabel.position.x,
        y: newLabel.position.y,
        visible: newLabel.isVisible,
        locked: newLabel.isLocked,
        layerId: selectedLayer.layerId, // Ensure you update the layer ID correctly
        datatypeId: selectedLayer.datatypeId,
      },
    ];
    return updatedShapes;
  });
};



const onEditLabel = (labelId, newText) => {
   // Update label in the sidebar
   const updatedLabels = labels.map(label =>
       label.id === labelId ? { ...label, text: newText } : label
   );
   setLabels(updatedLabels);

   // Update the corresponding text on the canvas
   const shapeNode = stageRef.current.findOne(`#${labelId}`);
   if (shapeNode) {
       shapeNode.text(newText);
       stageRef.current.batchDraw();
   }
};

const handleShapeUpdate1 = (updatedShape) => {
  setShapes((prevShapes) =>
      prevShapes.map((shape) =>
          shape.id === updatedShape.id ? { ...shape, ...updatedShape } : shape
      )
  );
};



 const onDeleteLabel = (labelId) => {
   // Remove the label from the sidebar list
   const updatedLabels = labels.filter(label => label.id !== labelId);
   setLabels(updatedLabels);
 
   // Also remove the label from the canvas by filtering out the corresponding shape
   const updatedShapes = shapes.filter(shape => shape.id !== labelId);
   setShapes(updatedShapes);
 
   // Additionally, remove the shape from the Konva canvas
   if (stageRef.current) {
     const shapeNode = stageRef.current.findOne(`#${labelId}`);
     if (shapeNode) {
       shapeNode.destroy();
       stageRef.current.draw(); // Re-draw the canvas after removing the node
     }
   } else {
     console.error('stageRef is not available');
   }
 };
 








 const onToggleLabelVisibility = (labelId) => {
   const updatedLabels = labels.map(label =>
       label.id === labelId ? { ...label, isVisible: !label.isVisible } : label
   );
   setLabels(updatedLabels);

   const shapeNode = stageRef.current.findOne(`#${labelId}`);
   if (shapeNode) {
       shapeNode.visible(!shapeNode.visible());
       stageRef.current.batchDraw();
   }
};


const onToggleAllVisibility = () => {
  setLabels((prevLabels) => {
      const areAnyVisible = prevLabels.some(label => label.isVisible);

      const updatedLabels = prevLabels.map(label => {
          const newVisibility = areAnyVisible ? false : true;

          // Update canvas visibility
          const shapeNode = stageRef.current.findOne(`#${label.id}`);
          if (shapeNode) {
              shapeNode.visible(!newVisibility); // Invert the visibility: hide when strike-through, show otherwise
          }

          return { ...label, isVisible: newVisibility };
      });

      // Redraw the canvas to reflect the visibility changes
      stageRef.current.batchDraw();

      return updatedLabels;
  });
};




const onToggleLabelLock = (labelId) => {
 const updatedLabels = labels.map(label =>
     label.id === labelId ? { ...label, isLocked: !label.isLocked } : label
 );
 setLabels(updatedLabels);

 const shapeNode = stageRef.current.findOne(`#${labelId}`);
 if (shapeNode) {
     shapeNode.draggable(!shapeNode.draggable()); // Disable dragging when locked
     stageRef.current.batchDraw();
 }
};



const handleInstanceSelect = (instanceData) => {
  console.log("Instance selected:", instanceData);
  // Add any necessary logic for instance selection
};

const onEndValueChange = (instanceId, newValue) => {
  console.log("End value changed for instance:", instanceId, "New Value:", newValue);
  // Add logic to update end values for instances
};

const addDesignToCanvas = (fileData) => {
  // Check if the ref has the loadDesign method exposed
  if (canvasRef.current && canvasRef.current.loadDesign) {
    canvasRef.current.loadDesign(fileData); // Call the method in CanvasComponent
  } else {
    console.error('Canvas component method not available.');
  }
};

// App.js
const handleAddDesign = async (designName, x, y, selectedFile) => {
  if (selectedFile.name.endsWith('.gds')) {
      try {
          const formData = new FormData();
          formData.append("file", selectedFile);

          const response = await fetch('http://54.224.177.87/convert-gds-to-json', {
              method: 'POST',
              body: formData,
          });

          console.log(formData)

          if (response.ok) {
              const result = await response.json();


              // Use the converted JSON to load the design into the canvas
              const layoutData = result.json_data;
              const fileData = { layoutData, x: parseFloat(x), y: parseFloat(y) };
              
              canvasRef.current.loadDesign(fileData);
          } else {
              console.error('Error converting GDS file:', response.statusText);
          }
      } catch (error) {
          console.error('Error uploading and converting GDS:', error);
      }
  } else {
      console.error('Invalid file type. Please upload a .gds file.');
  }
};


if (isLoginPopupOpen || !isAuthenticated) {
    return <LoginPopup onClose={handleCloseLoginPopup} />;
  }
return (
  <div className="container">
     (
      <>
        <ToolbarComponent
          onSquareClick={handleCreateRectangle}
          activateResize={handleActivateResize}
          onGroupClick={handleGroupShapes}
          onInstanceClick={handleInstanceClick}
          canvasRef={canvasRef}
          onLabelClick={handleLabelClick} 
          className="main-toolbar"
        />
        <div className="main-content">
          <CanvasToolbarComponent
            onDeleteClick={handleDeleteShapes}
            onCopyClick={handleCopyShapes}
            onPastClick={handlePastShapes}
            onLoadClick={handleLoadShapes}
            onCropClick={handleActivateCrop}
            onFitToScreenClick={handleFitToScreen}
            onSaveClick={handleSaveClick}
            onDirectorySelect={() => handleDirectorySelect(setDirectoryHandle, setSavedDesigns)}
            onNewDesignClick={handleNewDesign}
            addDesignToHierarchy={addDesignToHierarchy}
            projectName={projectName}
            savedDesigns={savedDesigns}
            onProjectNameChange={handleProjectNameChange}
            canvasRef={canvasRef}
            onSaveAsGDSClick={handleSaveAndConvertToGDS}
            firstInput={firstInput}
            secondInput={secondInput}
            updateInstanceVisibility={updateInstanceVisibility}
            shapes={shapes}
            setShapes={setShapes}
            
            className="canvas-toolbar"
          />
          <CanvasComponent
            ref={canvasRef}
            stageRef={stageRef}
            layerRef={layerRef}
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
            onShapeSelect={handleShapeSelect}
            setSelectedShape={setSelectedShape}
            directoryHandle={directoryHandle}
            projectName={projectName}
            addDesignToHierarchy={addDesignToHierarchy}
            updateSelectedShape={handleShapeSelect}
            layers={layers}
            setSelectedShapes={setSelectedShapes}
            setLabels={setLabels}
            addLabelToSidebar={addLabelToSidebar}
            setTopcellname={setTopcellname}
            setMissingLayers={setMissingLayers}
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
            shapes={shapes}
            setShapes={setShapes}
            layerVisibility={layerVisibility}
            lockedLayers={lockedLayers}
            groupedShapes={groupedShapes}
            setSelectedShape={setSelectedShape}
            selectedShape={selectedShape}
            layers={layers}
            setLayers={setLayers}
            selectedShapes={selectedShapes}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onShapeSelect={handleShapeSelect}
            toggleShapeVisibility={ontoggleShapeVisibility}
            designs={designs}
            canvasRef={canvasRef}
            addInstance={(instanceData) => canvasRef.current.addInstance(instanceData)}
            //stageref={stageRef}
            onEditLabel={onEditLabel}
            onDeleteLabel={onDeleteLabel}
            onToggleAllVisibility={onToggleAllVisibility} 
            onToggleLabelVisibility={onToggleLabelVisibility}
            onToggleLabelLock={onToggleLabelLock}
            labels={labels}
            handleInstanceSelect={handleInstanceSelect}
            onEndValueChange={onEndValueChange}
            projectName={projectName}
            addDesignToCanvas={(fileData) => addDesignToCanvas(fileData, layers)}
            addDesignToHierarchy={addDesignToHierarchy}
            topcellname={topcellname}
            stageRef={stageRef}
            setNewLayer={setNewLayer}
            newLayer={newLayer}
            triggerSave={triggerSave}
            layerRef={layerRef}
          />
          <DesignPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            onConfirm={handlePopupConfirm}
          />

<AddMissingLayersPopup
  isOpen={isMissingLayersPopupOpen}
  onClose={() => setIsMissingLayersPopupOpen(false)}
  missingLayers={missingLayers} // Pass missing layers array here
  //onAddLayers={handleAddMissingLayers}
  layers={layers}
  setLayers={setLayers}
  //setNewLayer={setNewLayer}
  setTriggerSave={() => setTriggerSave(true)}
/>

          
        </div>
      </>
    ) : (
      
    )
  </div>
);
};
export default App;