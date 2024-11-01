import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUpload, faDownload, faSort, faTrash, faEye, faEyeSlash, faLock, faUnlock, faShapes } from '@fortawesome/free-solid-svg-icons';
import './SidebarComponent.css';
import SaveGroupedShapesForm from './SaveGroupedShapesForm';
import { Pixelate } from 'konva/lib/filters/Pixelate';
import { Contrast } from 'konva/lib/filters/Contrast';
import ShapeProperties from './ShapeProperties';
import HierarchyComponent from '../HierarchyComponent';
import PropertyWindow from './PropertyWindow';
import LabelComponent from '../LabelComponent';

const SidebarComponent = ({
    onColorChange, onLayerSelected, onToggleLayerVisibility,
    onToggleAllLayersVisibility, onLayerUpdated, onToggleLayerLock,
    shapes, setShapes, layerVisibility, groupedShapes, activeTab,
    setActiveTab, selectedShape, onToggleAllLock, isAllLocked,
    toggleShapeVisibility, designs, canvasRef, addInstance,setSelectedShape, selectedShapes, labels, onDeleteLabel, onEditLabel,onToggleLabelVisibility, onToggleLabelLock, onToggleAllVisibility,handleInstanceSelect,onEndValueChange,projectName, addDesignToCanvas,addDesignToHierarchy, topcellname,stageRef, setNewLayer, newLayer, layerRef 
}) => {
    const [layers, setLayers] = useState([]);
    const [filteredLayers, setFilteredLayers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [showAddLayerForm, setShowAddLayerForm] = useState(false);
    // const [newLayer, setNewLayer] = useState({
    //     layer_number: '',
    //     datatype_number: '',
    //     layer_name: '',
    //     datatype_name: '',
    //     color: '#000000',
    //     boundaryColor: '#000000',
    //     pattern: { type: 'empty_fill', opacity: 0.5 },
    //     pixelate: 0,
    //     contrast: 0
    // });
    
    const [visibility, setVisibility] = useState({});
    const [lockedLayers, setLockedLayers] = useState({});
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [sortOrderName, setSortOrderName] = useState('asc');
    const [sortOrderNumber, setSortOrderNumber] = useState('asc');
    const [hideLayerName, setHideLayerName] = useState(false);
    const [hideDatatypeName, setHideDatatypeName] = useState(false);
    const [hideLayerNumber, setHideLayerNumber] = useState(false);
    const [hideDatatypeNumber, setHideDatatypeNumber] = useState(false);
    const [selectedRadioButton, setSelectedRadioButton] = useState('');
    const [isSidebarClosed, setIsSidebarClosed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showEditLayerForm, setShowEditLayerForm] = useState(false);
    const [allShapesVisible, setAllShapesVisible] = useState(true);
    const [pixelateValue, setPixelateValue] = useState(0);
    const [contrastValue, setContrastValue] = useState(0);
    const [isAscending, setIsAscending] = useState(true);
    const patternTypes = ['dotted', 'vertical_lines', 'horizontal_lines', 'diagonal_lines', 'cross', 'rev_diagonal_lines', 'empty_fill'];
    const [isFiltered, setIsFiltered] = useState(false);
    const [shapeProperties, setShapeProperties] = useState({});
    const fileInputRef = useRef(null);
    const prevLayersLength = useRef(layers.length);



    const [localLayers, setLocalLayers] = useState([]);

    useEffect(() => {
        const loadLayersFromBackend = async () => {
          try {
            const token = localStorage.getItem('access_token'); // Retrieve token from localStorage
            const response = await fetch('http://44.211.62.166/layers/user/layers', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Include token in headers
              },
            });
    
            if (!response.ok) {
              throw new Error('Failed to fetch layers');
            }
    
            const data = await response.json();
            if (data && data.layers) {
              setLayers(data.layers);
              setFilteredLayers(data.layers);
            } else {
              console.warn('No layers found');
            }
          } catch (error) {
            console.error('Error loading layers:', error);
          }
        };
    
        loadLayersFromBackend();
      }, [setLayers]);
    

    useEffect(() => {
        


        console.log('Filtered Layers Updated:', filteredLayers);
    }, [filteredLayers]);

    

    useEffect(() => {
        const savedLayers = localStorage.getItem('layers');
        if (savedLayers) {
            setLayers(JSON.parse(savedLayers));
            setFilteredLayers(JSON.parse(savedLayers)); 
        } else {
            loadLayersFromFile();
        }
    }, []);

    const loadLayersFromFile = async () => {
        try {
            const response = await fetch('http://44.211.62.166/layers/user/layers');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLayers(data.layers);
            setFilteredLayers(data.layers);
            saveLayersToBackend(data.layers);  // If you want to save locally too
        } catch (error) {
            console.error('Error loading layers:', error);
        }
    };
    

    const saveLayersToBackend = async (layersToSave) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('http://44.211.62.166/layers/user/layers', {
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


    

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the file input click
        }
    };
    // Function to handle file upload
    const uploadLayerMap = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('http://44.211.62.166/upload-layermap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Include token in headers
                      },
                    body: formData,
                });

                if (response.ok) {
                    console.log('File uploaded successfully.');
                    loadLayersFromFile();  // Reload layers from the backend
                } else {
                    console.error('Failed to upload file.');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };
    // Example usage within your component
    <input type="file" onChange={uploadLayerMap} accept=".json" />
    

    const deleteLayerFromBackend = async (layerToDelete) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://44.211.62.166/layers/user/layers/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include token in headers
                  },
                body: JSON.stringify(layerToDelete)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Error deleting layer:', error);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarClosed(!isSidebarClosed);
    };



    const getUsedLayerKeysRecursive = (shapes) => {
        const usedLayerKeys = new Set();
    
        const collectLayerKeys = (shapeList) => {
            shapeList.forEach(shape => {
                // Ensure `layerId` and `datatypeId` are treated as strings for uniform comparison
                const layerKey = `${shape.layerId}-${shape.datatypeId}`;
                usedLayerKeys.add(layerKey);
    
                // Recursively collect from children if they exist
                if (shape.children && shape.children.length > 0) {
                    collectLayerKeys(shape.children);
                }
            });
        };
    
        collectLayerKeys(shapes);
        return usedLayerKeys;
    };
    
    

    const filterUsedLayers = () => {
        if (!isFiltered) {
            // Get all used layer keys recursively (layerId-datatypeId) for filtering
            const usedLayerKeys = getUsedLayerKeysRecursive(shapes);
            
            // Filter layers based on the used keys (layer_number-datatype_number combination)
            const filtered = layers.filter(layer => 
                usedLayerKeys.has(`${layer.layer_number}-${layer.datatype_number}`)
            );
            
            // Update the filtered layers in the state
            setFilteredLayers(filtered);
        } else {
            // Restore all layers if the filter is toggled off
            setFilteredLayers(layers);
        }
    
        // Toggle the filter state
        setIsFiltered(!isFiltered);
    };
    
    

    const getLayerAndDatatypeNames = (layerNumber, datatypeNumber, layers) => {
        const layer = layers.find(l => l.layer_number === layerNumber && l.datatype_number === datatypeNumber);
        if (layer) {
            return {
                layerName: layer.layer_name || 'Unknown Layer',
                datatypeName: layer.datatype_name || 'Unknown Datatype'
            };
        }
        return { layerName: 'Unknown Layer', datatypeName: 'Unknown Datatype' };
    };

    const handleLayerChange = (field, value) => {
        const updatedLayer = { ...selectedLayer, [field]: field.includes('number') ? parseInt(value, 10) : value };
        const updatedLayers = layers.map(layer =>
            layer.layer_number === updatedLayer.layer_number && layer.datatype_number === updatedLayer.datatype_number
                ? updatedLayer
                : layer
        );
        setSelectedLayer(updatedLayer);
        setLayers(updatedLayers);
        setFilteredLayers(updatedLayers);
        saveLayersToBackend(updatedLayers);
        onLayerUpdated(updatedLayer);

        if (field === 'color' || field === 'boundaryColor' || field === 'pattern') {
            const updatedShapes = shapes.map(shape =>
                shape.layerId === updatedLayer.layer_number
                    ? {
                        ...shape,
                        color: field === 'color' ? value : shape.color,
                        boundaryColor: field === 'boundaryColor' ? value : shape.boundaryColor,
                        pattern: field === 'pattern' ? value : shape.pattern,
                        opacity: field === 'pattern' ? value.opacity : shape.opacity
                    }
                    : shape
            );
            setShapes(updatedShapes);
        }
    };

    
    const toggleAddLayerForm = () => {
        setShowAddLayerForm(!showAddLayerForm);
    };

    const toggleVisibility = (field) => {
        switch (field) {
            case 'layer_name':
                setHideLayerName(!hideLayerName);
                break;
            case 'datatype_name':
                setHideDatatypeName(!hideDatatypeName);
                break;
            case 'layer_number':
                setHideLayerNumber(!hideLayerNumber);
                break;
            case 'datatype_number':
                setHideDatatypeNumber(!hideDatatypeNumber);
                break;
            default:
                break;
        }
    };

    const filterLayers = () => {
        let filtered = layers.filter(layer =>
            layer.layer_name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredLayers(filtered);
    };

    const selectLayer = (layer) => {
        setSelectedLayer(layer);
        onLayerSelected(layer);
    };


    

    const addLayer = async () => {
        const isDuplicate = layers.some(layer =>
            (layer.layer_name === newLayer.layer_name && layer.datatype_name === newLayer.datatype_name) ||
            (layer.layer_number === newLayer.layer_number && layer.datatype_number === newLayer.datatype_number)
        );

        if (isDuplicate) {
            alert('Duplicate layer detected. Both layer name and datatype name cannot be the same, and both layer number and datatype number cannot be the same.');
        } else {
            const updatedLayers = [...layers, { ...newLayer }];
            setLayers(updatedLayers);
            setFilteredLayers(updatedLayers);
            setShowAddLayerForm(false);
            await saveLayersToBackend(updatedLayers);

            setNewLayer({
                layer_number: 0,
                datatype_number: 0,
                layer_name: '',
                datatype_name: '',
                color: '#000000',
                boundaryColor: '#000000',
                pattern: { type: 'empty_fill', opacity: 0.5 }
            });
        }
    };

    const deleteLayer = async () => {
        if (!selectedLayer) {
            console.error('No layer selected for deletion.');
            return;
        }

        const { layer_name, datatype_name, layer_number, datatype_number } = selectedLayer;

        if (
            typeof layer_name === 'undefined' ||
            typeof datatype_name === 'undefined' ||
            typeof layer_number === 'undefined' ||
            typeof datatype_number === 'undefined'
        ) {
            console.error('Selected layer properties are not fully defined:', selectedLayer);
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete the following layer?\n
            Name: ${layer_name}\n
            Datatype Name: ${datatype_name}\n
            Layer Number: ${layer_number}\n
            Datatype Number: ${datatype_number}`);

        if (confirmDelete) {
            try {
                const updatedShapes = shapes.filter(shape =>
                    !(shape.layerId === layer_number &&
                        shape.datatypeId === datatype_number)
                );

                setShapes(updatedShapes);

                const updatedLayers = layers.filter(layer =>
                    !(layer.layer_name === layer_name &&
                        layer.datatype_name === datatype_name &&
                        layer.layer_number === layer_number &&
                        layer.datatype_number === datatype_number)
                );

                setLayers(updatedLayers);
                setFilteredLayers(updatedLayers);
                setSelectedLayer(null);
                await deleteLayerFromBackend(selectedLayer);

                if (onLayerUpdated) {
                    onLayerUpdated();
                }
            } catch (error) {
                console.error('An error occurred while deleting the layer:', error);
            }
        }
    };

    
    

    const downloadLayerMap = () => {
        const dataStr = JSON.stringify({ layers }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'layers.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const sortLayersByName = () => {
        const sortedLayers = [...layers].sort((a, b) => {
            return sortOrderName === 'asc'
                ? a.layer_name.localeCompare(b.layer_name)
                : b.layer_name.localeCompare(a.layer_name);
        });

        setFilteredLayers(sortedLayers);
        setSortOrderName(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const sortLayersByNumber = () => {
        const sortedLayers = [...layers].sort((a, b) => {
            return sortOrderNumber === 'asc'
                ? a.layer_number - b.layer_number
                : b.layer_number - a.layer_number;
        });

        setFilteredLayers(sortedLayers);
        setSortOrderNumber(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const onEditModeChange = () => {
        if (editMode) {
            saveChanges();
        }
        setEditMode(!editMode);
        setSelectedRadioButton(editMode ? '' : 'edit_all');
    };

    const handleColorPickerChange = (field, value) => {
        const updatedLayer = { ...selectedLayer, [field]: value };
        setSelectedLayer(updatedLayer);
    
        // Update the layers in the state
        const updatedLayers = layers.map(layer =>
            layer.layer_number === updatedLayer.layer_number && layer.datatype_number === updatedLayer.datatype_number
                ? updatedLayer
                : layer
        );
        setLayers(updatedLayers);
        setFilteredLayers(updatedLayers);
        saveLayersToBackend(updatedLayers);
    
        // Recursive function to update color for shapes and their children
        const updateColorRecursive = (shapes) => {
            return shapes.map(shape => {
                // Check if the shape belongs to the selected layer
                if (shape.layerId === String(updatedLayer.layer_number) && shape.datatypeId === String(updatedLayer.datatype_number)) {
                    let updatedShape = { ...shape, color: value };
    
                    // Recursively update color for children if they exist
                    if (updatedShape.children && updatedShape.children.length > 0) {
                        updatedShape.children = updateColorRecursive(updatedShape.children);
                    }
    
                    return updatedShape;
                }
    
                // Recursively traverse into children even if this shape is not updated
                if (shape.children && shape.children.length > 0) {
                    shape.children = updateColorRecursive(shape.children);
                }
    
                return shape;
            });
        };
    
        // Recursively update color for all shapes and their children
        const updatedShapes = updateColorRecursive(shapes);
        setShapes(updatedShapes); // Update shapes in the state to reflect changes on the canvas
    };
    
    const updateOpacity = (event) => {
        const opacityValue = parseFloat(event.target.value);
        const updatedPattern = { ...selectedLayer.pattern, opacity: opacityValue };
        const updatedLayer = { ...selectedLayer, pattern: updatedPattern };
        setSelectedLayer(updatedLayer);
    
        const updatedLayers = layers.map(layer =>
            layer.layer_number === updatedLayer.layer_number && layer.datatype_number === updatedLayer.datatype_number
                ? updatedLayer
                : layer
        );
        setLayers(updatedLayers);
        setFilteredLayers(updatedLayers);
        saveLayersToBackend(updatedLayers);
    
        const updateOpacityRecursive = (shapes) => {
            return shapes.map(shape => {
                // Check if the shape belongs to the selected layer
                if (shape.layerId === String(updatedLayer.layer_number) && shape.datatypeId === String(updatedLayer.datatype_number)) {
                    let updatedShape = { ...shape, opacity: opacityValue };
    
                    // Recursively update opacity for children if they exist
                    if (updatedShape.children && updatedShape.children.length > 0) {
                        updatedShape.children = updateOpacityRecursive(updatedShape.children);
                    }
    
                    return updatedShape;
                }
    
                // Recursively traverse into children even if this shape is not updated
                if (shape.children && shape.children.length > 0) {
                    shape.children = updateOpacityRecursive(shape.children);
                }
    
                return shape;
            });
        };
    
        const updatedShapes = updateOpacityRecursive(shapes);
        setShapes(updatedShapes); // Ensure shapes are updated on the canvas
    };
    
    
    
    const saveChanges = () => {
        if (selectedLayer) {
            const updatedLayers = layers.map(layer =>
                layer.layer_number === selectedLayer.layer_number && layer.datatype_number === selectedLayer.datatype_number
                    ? { ...selectedLayer }
                    : layer
            );
            setLayers(updatedLayers);
            setFilteredLayers(updatedLayers);
            saveLayersToBackend(updatedLayers);
            onLayerUpdated(selectedLayer);
        }
    };

    const getLockIcon = (layer) => {
        const key = `${layer.layer_number}-${layer.datatype_number}`;
        
        return lockedLayers[key] ? faLock : faUnlock;
    };

    const handleLayerLockToggle = (layer) => {
        alert(layer)
        onToggleLayerLock(layer);
    };

    const updateShapesVisibility = (layerKey, isVisible) => {
        const updatedShapes = shapes.map(shape => {
            if (`${shape.layerId}-${shape.datatypeId}` === layerKey) {
                return { ...shape, visible: isVisible };
            }
            return shape;
        });
        setShapes(updatedShapes);
    };
    const updateShape = (updatedShape) => {
        setShapes((prevShapes) =>
          prevShapes.map(shape =>
            shape.id === updatedShape.id ? { ...shape, ...updatedShape } : shape
          )
        );
        onShapeUpdate(updatedShape); // Notify App.js of the update
      };
      

    const toggleVisibility1 = (layer) => {
        onToggleLayerVisibility(layer);
    };

    const getVisibilityIcon = (layer) => {
        const key = `${layer.layer_number}-${layer.datatype_number}`;
        return layerVisibility[key] !== false ? faEye : faEyeSlash;
    };

    const toggleAllShapesVisibilityIcon = () => {
        const newVisibility = !allShapesVisible;
        setAllShapesVisible(newVisibility);

        const updatedShapes = shapes.map(shape => ({
            ...shape,
            visible: newVisibility,
        }));
        setShapes(updatedShapes);

        onToggleAllLayersVisibility(newVisibility);
    };

    const updatePixelate = (event) => {
        const pixelateValue = parseFloat(event.target.value);
        setPixelateValue(pixelateValue);

        const updatedLayer = { ...selectedLayer, pixelate: pixelateValue };
        setSelectedLayer(updatedLayer);

        const updatedLayers = layers.map(layer =>
            layer.layer_number === updatedLayer.layer_number && layer.datatype_number === updatedLayer.datatype_number
                ? updatedLayer
                : layer
        );
        setLayers(updatedLayers);
        setFilteredLayers(updatedLayers);
        saveLayersToBackend(updatedLayers);

        const updatedShapes = shapes.map(shape =>
            shape.layerId === updatedLayer.layer_number
                ? { ...shape, pixelSize: pixelateValue, filters: [Pixelate] }
                : shape
        );
        setShapes(updatedShapes);
    };
    

    const updateContrast = (event) => {
        const contrastValue = parseFloat(event.target.value);
        setContrastValue(contrastValue);

        const updatedLayer = { ...selectedLayer, contrast: contrastValue };
        setSelectedLayer(updatedLayer);

        const updatedLayers = layers.map(layer =>
            layer.layer_number === updatedLayer.layer_number && layer.datatype_number === updatedLayer.datatype_number
                ? updatedLayer
                : layer
        );
        setLayers(updatedLayers);
        setFilteredLayers(updatedLayers);
        saveLayersToBackend(updatedLayers);

        const updatedShapes = shapes.map(shape =>
            shape.layerId === updatedLayer.layer_number
                ? { ...shape, contrast: contrastValue, filters: [Contrast] }
                : shape
        );
        setShapes(updatedShapes);
    };

    const onFileChange = (event) => {
        const input = event.target;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const fileContent = reader.result;
                    const jsonData = JSON.parse(fileContent);

                    if (jsonData.layers && Array.isArray(jsonData.layers)) {
                        setLayers(jsonData.layers);
                        setFilteredLayers(jsonData.layers);
                        saveLayersToBackend(jsonData.layers);

                        console.log("Layers updated from uploaded file:", jsonData.layers);

                        if (typeof onLayerUpdated === 'function') {
                            onLayerUpdated(jsonData.layers);
                        }
                    } else {
                        console.error("Invalid file format: 'layers' key not found or not an array.");
                    }
                } catch (error) {
                    console.error("Error parsing file content:", error);
                }
            };

            reader.readAsText(file);
        }
    };


    const updateShapeProperty = (id, property, value) => {
        setShapes(prevShapes =>
          prevShapes.map(shape =>
            shape.id === id ? { ...shape, [property]: value } : shape
          )
        );
      };
      
     
     

    return (
        <div className={`sidebar ${isSidebarClosed ? 'closed' : ''}`}>
            <div className="sidebar-opener" onClick={toggleSidebar}>
                <span>{isSidebarClosed ? '<' : '>'}</span>
            </div>
            {!isSidebarClosed && (
                <div className="sidebar-content">
                    <div className="sidebar-tabs">
                        <button className={`tab-button ${activeTab === 'layermap' ? 'active' : ''}`} onClick={() => setActiveTab('layermap')}>Layer Map</button>
                        <button className={`tab-button ${activeTab === 'property' ? 'active' : ''}`} onClick={() => setActiveTab('property')}>Property</button>
                        <button className={`tab-button ${activeTab === 'hierarchy' ? 'active' : ''}`} onClick={() => setActiveTab('hierarchy')}>Hierarchy</button>
                        <button className={`tab-button ${activeTab === 'label' ? 'active' : ''}`} onClick={() => setActiveTab('label')}>Label</button>
                    </div>

                    {activeTab==='label' &&
                    <LabelComponent 
                    shapes={shapes} 
                    onDeleteLabel={onDeleteLabel} 
                    onEditLabel={onEditLabel}
                    onToggleAllVisibility={onToggleAllVisibility}
                    onToggleLabelVisibility={onToggleLabelVisibility}
                    onToggleLabelLock={onToggleLabelLock}
                  />}
                    

                    
                    {activeTab === 'hierarchy' && (
                        <HierarchyComponent
                        addDesignToHierarchy={addDesignToHierarchy}
                        shapes={shapes}  // Pass the shapes array
                        toggleShapeVisibility={toggleShapeVisibility}
                        addInstance={addInstance}
                        handleInstanceSelect={handleInstanceSelect}
                        onEndValueChange={onEndValueChange}
                        projectName={projectName}  // Pass the project name
                        addDesignToCanvas={addDesignToCanvas}
                        topcellname={topcellname}
                        setShapes={setShapes}
                      />
                      
                    )}
                    {activeTab === 'property' && <PropertyWindow
    selectedShapes={selectedShapes}
    layers={layers}
    onUpdateShape={updateShapeProperty}
    setSelectedShape={setSelectedShape} // Pass the update function to PropertyWindow
    stageRef={stageRef}
    layerRef={layerRef}
    setShapes={setShapes}
/>}

                    {activeTab === 'layermap' && (
                        <>
                            <svg width="0" height="0">
                                <defs>
                                    <pattern id="horizontal_lines" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <path d="M 0 0 L 10 0" stroke="black" strokeWidth="1" />
                                    </pattern>
                                    <pattern id="vertical_lines" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <path d="M 0 0 L 0 10" stroke="black" strokeWidth="1" />
                                    </pattern>
                                    <pattern id="diagonal_lines" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <path d="M 0 10 L 10 0" stroke="black" strokeWidth="1" />
                                    </pattern>
                                    <pattern id="cross" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="black" strokeWidth="1" />
                                    </pattern>
                                    <pattern id="dotted" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <circle cx="5" cy="5" r="1" fill="black" />
                                    </pattern>
                                    <pattern id="rev_diagonal_lines" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <path d="M 0 0 L 10 10" stroke="black" strokeWidth="1" />
                                    </pattern>
                                    <pattern id="empty_fill" patternUnits="userSpaceOnUse" width="10" height="10">
                                        <rect width="10" height="10" fill="none" />
                                    </pattern>
                                </defs>
                            </svg>
                            <div className="sidebar-header">
                                <div className="icon-grid">
                                    <div className="icon-row">
                                        <button onClick={toggleAddLayerForm}>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                        <button onClick={handleUploadClick}>
                                            <FontAwesomeIcon icon={faUpload} />
                                        </button>
                                        <button onClick={downloadLayerMap}>
                                            <FontAwesomeIcon icon={faDownload} />
                                        </button>
                                        <button onClick={sortLayersByName}>
                                            <FontAwesomeIcon icon={faSort} />
                                        </button>
                                        <button onClick={sortLayersByNumber}>
                                            <FontAwesomeIcon icon={faSort} />
                                        </button>
                                        <button onClick={filterUsedLayers}>
                                            <FontAwesomeIcon icon={faShapes} />
                                        </button>
                                        <button onClick={deleteLayer}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                    <div className="icon-row">
                                        <input type="checkbox" onChange={() => toggleVisibility('layer_name')} checked={!hideLayerName} />
                                        <input type="checkbox" onChange={() => toggleVisibility('datatype_name')} checked={!hideDatatypeName} />
                                        <input type="checkbox" onChange={() => toggleVisibility('layer_number')} checked={!hideLayerNumber} />
                                        <input type="checkbox" onChange={() => toggleVisibility('datatype_number')} checked={!hideDatatypeNumber} />
                                        <label className="switch">
                                            <input type="checkbox" checked={editMode} onChange={onEditModeChange} />
                                            <span className="slider round"></span>
                                        </label>
                                        <button onClick={toggleAllShapesVisibilityIcon}>
                                            <FontAwesomeIcon icon={allShapesVisible ? faEye : faEyeSlash} />
                                        </button>
                                        <button onClick={onToggleAllLock}>
                                            <FontAwesomeIcon icon={isAllLocked ? faLock : faUnlock} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="sidebar-search">
                                <input type="text" placeholder="Search" value={searchText} onChange={(e) => { setSearchText(e.target.value); filterLayers(); }} />
                            </div>

                            {showAddLayerForm && (
                                <div className="add-layer-form">
                                    <div className="form-row">
                                        <input type="text" placeholder="Layer Name" value={newLayer.layer_name} onChange={(e) => setNewLayer({ ...newLayer, layer_name: e.target.value })} />
                                        <input type="text" placeholder="Datatype Name" value={newLayer.datatype_name} onChange={(e) => setNewLayer({ ...newLayer, datatype_name: e.target.value })} />
                                    </div>
                                    <div className="form-row">
                                        <input type="number" placeholder="Layer Number" value={newLayer.layer_number} onChange={(e) => setNewLayer({ ...newLayer, layer_number: e.target.value ? +e.target.value : '' })} />
                                        <input type="number" placeholder="Datatype Number" value={newLayer.datatype_number} onChange={(e) => setNewLayer({ ...newLayer, datatype_number: e.target.value ? +e.target.value : '' })} />
                                    </div>
                                    <div className="form-row">
                                        <input type="color" placeholder="Fill" value={newLayer.color} onChange={(e) => setNewLayer({ ...newLayer, color: e.target.value })} />
                                        <div className="slider-container">
                                            <label htmlFor="opacitySlider">Fade:</label>
                                            <input className='addlayeropacity' type="range" id="opacitySlider" min="0" max="1" step="0.01" value={newLayer.pattern.opacity} onChange={(e) => setNewLayer({ ...newLayer, pattern: { ...newLayer.pattern, opacity: e.target.value } })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <button className='addlayerbutton' onClick={addLayer}>Add Layer</button>
                                    </div>
                                </div>
                            )}
                            <div className="layer-controls">
                                <div className="form-row-inline">
                                    <input type="color" value={selectedLayer?.color || '#000000'} onChange={(e) => handleColorPickerChange('color', e.target.value)} />
                                    <input type="range" id='pixelate-slider' min="0" max="10" step="1" value={pixelateValue} onChange={updatePixelate} disabled={!selectedLayer} />
                                    <input type="range" id='contrast-slider' min="-100" max="100" step="1" value={contrastValue} onChange={updateContrast} disabled={!selectedLayer} />
                                    <input type="range" id='opacityslider' min="0" max="1" step="0.01" value={selectedLayer?.pattern?.opacity} onChange={updateOpacity} disabled={!selectedLayer} />
                                </div>
                            </div>
                            <div className="layer-item-container">
                                {filteredLayers.map((layer) => (
                                    <div key={`${layer.layer_number}-${layer.datatype_number}`} className={`layer-item ${layer === selectedLayer ? 'selected-layer' : ''}`} onClick={() => selectLayer(layer)}>
                                        <div className="color-box" style={{ borderColor: layer.boundaryColor }}>
                                            <div className="pattern-box" style={{ backgroundColor: layer.color, backgroundImage: `url(${layer.pattern.type})`, opacity: layer.pattern.opacity }}></div>
                                        </div>
                                        <button className='layer-eye-icon' onClick={() => toggleVisibility1(layer)}>
                                            <FontAwesomeIcon icon={getVisibilityIcon(layer)} />
                                        </button>
                                        <div className="layer-details">
                                            <div className="layer-info">
                                                <div className="info-row">
                                                    {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'layer_name' && !hideLayerName) ? (<input type="text" value={layer.layer_name} onChange={(e) => handleLayerChange('layer_name', e.target.value)} className="editable-input layer-name" style={{ width: '40px' }} />) : (!hideLayerName && <span className="layer-name">{layer.layer_name}</span>)}
                                                    {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'datatype_name' && !hideDatatypeName) ? (<input type="text" value={layer.datatype_name} onChange={(e) => handleLayerChange('datatype_name', e.target.value)} className="editable-input data-type-name" style={{ width: '40px' }} />) : (!hideDatatypeName && <span className="data-type-name">{layer.datatype_name}</span>)}
                                                    {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'layer_number' && !hideLayerNumber) ? (<input type="number" value={layer.layer_number} onChange={(e) => handleLayerChange('layer_number', e.target.value)} className="editable-input layer-number" style={{ width: '22px' }} />) : (!hideLayerNumber && <span className="layer-number">{layer.layer_number}</span>)}
                                                    {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'datatype_number' && !hideDatatypeNumber) ? (<input type="number" value={layer.datatype_number} onChange={(e) => handleLayerChange('datatype_number', e.target.value)} className="editable-input data-type-number" style={{ width: '22px' }} />) : (!hideDatatypeNumber && <span className="data-type-number">{layer.datatype_number}</span>)}
                                                </div>
                                            </div>
                                            <div className="layer-icons">
                                                <button className='layer-lock-icon' onClick={() => handleLayerLockToggle(layer)}>
                                                    <FontAwesomeIcon icon={getLockIcon(layer)} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <input type="file" id="fileInput" ref={fileInputRef} onChange={uploadLayerMap} accept=".json" hidden />
                            
                            <input type="file" id="fileInput" onChange={onFileChange} accept=".json" hidden />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SidebarComponent;
