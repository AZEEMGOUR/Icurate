import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUpload, faDownload, faSort, faTrash, faEye, faEyeSlash, faLock, faUnlock, faShapes } from '@fortawesome/free-solid-svg-icons';
import './SidebarComponent.css';
import SaveGroupedShapesForm from './SaveGroupedShapesForm';
import { Pixelate } from 'konva/lib/filters/Pixelate';

const SidebarComponent = ({ onColorChange, onLayerSelected, onToggleLayerVisibility, onToggleAllLayersVisibility, onLayerUpdated, onToggleLayerLock, shapes, setShapes, layerVisibility, groupedShapes }) => {
    const [layers, setLayers] = useState([]);
    const [filteredLayers, setFilteredLayers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [showAddLayerForm, setShowAddLayerForm] = useState(false);
    const [newLayer, setNewLayer] = useState({
        layer_number: 0,
        datatype_number: 0,
        layer_name: '',
        datatype_name: '',
        color: '#000000',
        boundaryColor: '#000000',
        pattern: { type: 'empty_fill', opacity: 0.5 }
    });
    const [visibility, setVisibility] = useState({});
    const [lockedLayers, setLockedLayers] = useState({});
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [sortOrder, setSortOrder] = useState({
        layerName: 'asc',
        layerNumber: 'asc'
    });
    const [hideLayerName, setHideLayerName] = useState(false);
    const [hideDatatypeName, setHideDatatypeName] = useState(false);
    const [hideLayerNumber, setHideLayerNumber] = useState(false);
    const [hideDatatypeNumber, setHideDatatypeNumber] = useState(false);
    const [selectedRadioButton, setSelectedRadioButton] = useState('');
    const [isSidebarClosed, setIsSidebarClosed] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showEditLayerForm, setShowEditLayerForm] = useState(false);
    const [activeTab, setActiveTab] = useState('layermap');
    const [isAscending, setIsAscending] = useState(true);
    const [allShapesVisible, setAllShapesVisible] = useState(true);
    const patternTypes = ['dotted', 'vertical_lines', 'horizontal_lines', 'diagonal_lines', 'cross', 'rev_diagonal_lines', 'empty_fill'];

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
            const response = await fetch('assets/layermap.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLayers(data.layers);
            setFilteredLayers(data.layers);
            saveLayersToFile(data.layers);
        } catch (error) {
            console.error('Error loading layers:', error);
        }
    };

    const saveLayersToFile = (layersToSave) => {
        localStorage.setItem('layers', JSON.stringify(layersToSave || layers));
    };

    const toggleSidebar = () => {
        setIsSidebarClosed(!isSidebarClosed);
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const debouncedUpdateLayer = useCallback(
        debounce((updatedLayer) => {
            onLayerUpdated(updatedLayer);
        }, 500),
        []
    );
    const filterUsedLayers = () => {
        const usedLayerNumbers = new Set(shapes.map(shape => shape.layerId));
        const filtered = layers.filter(layer => usedLayerNumbers.has(layer.layer_number));
        setFilteredLayers(filtered);
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
        saveLayersToFile(updatedLayers);
        onLayerUpdated(updatedLayer);

        // Update shapes dynamically
        if (Array.isArray(shapes)) {
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

    const handleColorPickerChange = (field, value) => {
        handleLayerChange(field, value);
        if (field === 'color') {
            onColorChange(value);
        }
    };

    const updateOpacity = (event) => {
        const opacityValue = parseFloat(event.target.value);
        const updatedPattern = { ...selectedLayer.pattern, opacity: opacityValue };
        const updatedLayer = { ...selectedLayer, pattern: updatedPattern };
        
        // Update the selected layer
        setSelectedLayer(updatedLayer);

        // Update the layers state
        const updatedLayers = layers.map(layer =>
            layer.layer_number === updatedLayer.layer_number && layer.datatype_number === updatedLayer.datatype_number
                ? updatedLayer
                : layer
        );
        setLayers(updatedLayers);
        setFilteredLayers(updatedLayers);
        saveLayersToFile(updatedLayers);

        // Update the shapes dynamically
        if (Array.isArray(shapes)) {
            const updatedShapes = shapes.map(shape =>
                shape.layerId === updatedLayer.layer_number
                    ? { ...shape, opacity: opacityValue }
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
    const toggleAllShapesVisibility = () => {
        const newVisibility = !allShapesVisible;
        updateShapesVisibility(newVisibility);
        setAllShapesVisible(newVisibility);
    };

    const addLayer = () => {
        const updatedLayers = [...layers, { ...newLayer }];
        setLayers(updatedLayers);
        setFilteredLayers(updatedLayers);
        setShowAddLayerForm(false);
        saveLayersToFile(updatedLayers);
        setNewLayer({
            layer_number: 0,
            datatype_number: 0,
            layer_name: '',
            datatype_name: '',
            color: '#000000',
            boundaryColor: '#000000',
            pattern: { type: 'empty_fill', opacity: 0.5 }
        });
    };

    const deleteLayer = () => {
        if (selectedLayer) {
            const confirmDelete = window.confirm(`Are you sure you want to delete the following layer?\n
            Name: ${selectedLayer.layer_name}\n
            Datatype Name: ${selectedLayer.datatype_name}\n
            Layer Number: ${selectedLayer.layer_number}\n
            Datatype Number: ${selectedLayer.datatype_number}`);
            if (confirmDelete) {
                const updatedLayers = layers.filter(layer => layer !== selectedLayer);
                setLayers(updatedLayers);
                setFilteredLayers(updatedLayers);
                setSelectedLayer(null);
                saveLayersToFile(updatedLayers);
            }
        }
    };

    const uploadLayerMap = () => {
        document.getElementById('fileInput').click();
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

    const onFileChange = (event) => {
        const input = event.target;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const fileContent = reader.result;
                updateLayersFromFile(fileContent);
            };
            reader.readAsText(file);
        }
    };

    const updateLayersFromFile = (fileContent) => {
        try {
            const jsonData = JSON.parse(fileContent);
            if (jsonData.layers && Array.isArray(jsonData.layers)) {
                setLayers(jsonData.layers);
                setFilteredLayers(jsonData.layers);
                saveLayersToFile(jsonData.layers);
            } else {
                console.error("Invalid file format");
            }
        } catch (error) {
            console.error("Error parsing file content:", error);
        }
    };

    const sortLayersByName = () => {
        setFilteredLayers(prevFilteredLayers => {
            const sortedLayers = [...prevFilteredLayers].sort((a, b) => {
                if (isAscending) {
                    return a.layer_name.localeCompare(b.layer_name);
                } else {
                    return b.layer_name.localeCompare(a.layer_name);
                }
            });
            return sortedLayers;
        });
        setIsAscending(prevIsAscending => !prevIsAscending);
    };

    const sortLayersByNumber = () => {
        setFilteredLayers(prevFilteredLayers => {
            const sortedLayers = [...prevFilteredLayers].sort((a, b) => {
                if (isAscending) {
                    return a.layer_number - b.layer_number;
                } else {
                    return b.layer_number - a.layer_number;
                }
            });
            return sortedLayers;
        });
        setIsAscending(prevIsAscending => !prevIsAscending);
    };

    const onEditModeChange = () => {
        if (editMode) {
            saveChanges();
        }
        setEditMode(!editMode);
        setSelectedRadioButton(editMode ? '' : 'edit_all');
    };

    const saveChanges = () => {
        if (selectedLayer) {
            const updatedLayers = layers.map(layer =>
                layer.layer_number === selectedLayer.layer_number && layer.datatype_number === selectedLayer.datatype_number
                    ? { ...selectedLayer } // Update with the selectedLayer's current state
                    : layer
            );
            setLayers(updatedLayers); // Update the layers state
            setFilteredLayers(updatedLayers); // Update the filtered layers state
            saveLayersToFile(updatedLayers); // Save the layers to local storage
            onLayerUpdated(selectedLayer); // Notify parent component about the update
        }
    };
    

    const handleToggleLayerVisibility = (layer) => {
        const key = `${layer.layer_number}-${layer.datatype_number}`;
        const newVisibility = !visibility[key];
        setVisibility((prev) => ({ ...prev, [key]: newVisibility }));
        onToggleLayerVisibility(layer);
    };

    const getLockIcon = (layer) => {
        const key = `${layer.layer_number}-${layer.datatype_number}`;
        return lockedLayers[key] ? faLock : faUnlock;
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

    const toggleVisibility1 = (layer) => {
        onToggleLayerVisibility(layer);
    };

    const getVisibilityIcon = (layer) => {
        const key = `${layer.layer_number}-${layer.datatype_number}`;
        return layerVisibility[key] !== false ? faEye : faEyeSlash;
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
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
                        <button className={`tab-button ${activeTab === 'reserve' ? 'active' : ''}`} onClick={() => handleTabClick('Reserve')}>Reserve</button>
                    </div>
                    {activeTab === 'Reserve' && <SaveGroupedShapesForm groupedShapes={groupedShapes} />}
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
                                <button onClick={uploadLayerMap}>
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
                                <button onClick={toggleAllShapesVisibility}>
                                    <FontAwesomeIcon icon={allShapesVisible ? faEyeSlash : faEye} />
                                </button>
                                <button onClick={() => onToggleLayerLock(selectedLayer)}>
                                    <FontAwesomeIcon icon={faLock} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="sidebar-search">
                        <input type="text" placeholder="Search" value={searchText} onChange={(e) => { setSearchText(e.target.value); filterLayers(); }} />
                    </div>
                    <div className="layer-controls">
                        <div className="form-row-inline">
                            <input type="color" value={selectedLayer?.color || '#000000'} onChange={(e) => handleColorPickerChange('color', e.target.value)} />
                            <input type="color" value={selectedLayer?.boundaryColor || '#000000'} onChange={(e) => handleColorPickerChange('boundaryColor', e.target.value)} />
                            <input type="range" id='opacityslider' min="0" max="1" step="0.01" value={selectedLayer?.pattern?.opacity } onChange={updateOpacity} disabled={!selectedLayer} />
                        </div>
                    </div>
                    {showAddLayerForm && (
                        <div className="add-layer-form">
                            <div className="form-row">
                                <input type="text" placeholder="Layer Name" value={newLayer.layer_name} onChange={(e) => setNewLayer({ ...newLayer, layer_name: e.target.value })} />
                                <input type="text" placeholder="Datatype Name" value={newLayer.datatype_name} onChange={(e) => setNewLayer({ ...newLayer, datatype_name: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <input type="number" placeholder="Layer Number" value={newLayer.layer_number} onChange={(e) => setNewLayer({ ...newLayer, layer_number: +e.target.value })} />
                                <input type="number" placeholder="Datatype Number" value={newLayer.datatype_number} onChange={(e) => setNewLayer({ ...newLayer, datatype_number: +e.target.value })} />
                            </div>
                            <div className="form-row">
                                <input type="color" placeholder="Fill" value={newLayer.color} onChange={(e) => setNewLayer({ ...newLayer, color: e.target.value })} />
                                <input type="color" placeholder="Boundary" value={newLayer.boundaryColor} onChange={(e) => setNewLayer({ ...newLayer, boundaryColor: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="slider-container">
                                    <label htmlFor="opacitySlider">Fade: {newLayer.pattern.opacity}</label>
                                    <input type="range" id="opacitySlider" min="0" max="1" step="0.01" value={newLayer.pattern.opacity} onChange={(e) => setNewLayer({ ...newLayer, pattern: { ...newLayer.pattern, opacity: e.target.value } })} />
                                </div>
                                <select value={newLayer.pattern.type} onChange={(e) => setNewLayer({ ...newLayer, pattern: { ...newLayer.pattern, type: e.target.value } })}>
                                    {patternTypes.map((pattern) => (
                                        <option key={pattern} value={pattern}>{pattern}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={addLayer}>Add Layer</button>
                        </div>
                    )}
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
                                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'layer_name' && !hideLayerName) ? (<input type="text" value={layer.layer_name} onChange={(e) => handleLayerChange('layer_name', e.target.value)} className="editable-input layer-name" style={{ width: '40px' }}/>) : (!hideLayerName && <span className="layer-name">{layer.layer_name}</span>)}
                                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'datatype_name' && !hideDatatypeName) ? (<input type="text" value={layer.datatype_name} onChange={(e) => handleLayerChange('datatype_name', e.target.value)} className="editable-input data-type-name" style={{ width: '40px' }} />) : (!hideDatatypeName && <span className="data-type-name">{layer.datatype_name}</span>)}
                                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'layer_number' && !hideLayerNumber) ? (<input type="number" value={layer.layer_number} onChange={(e) => handleLayerChange('layer_number', e.target.value)} className="editable-input layer-number" style={{ width: '22px' }} />) : (!hideLayerNumber && <span className="layer-number">{layer.layer_number}</span>)}
                                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'datatype_number' && !hideDatatypeNumber) ? (<input type="number" value={layer.datatype_number} onChange={(e) => handleLayerChange('datatype_number', e.target.value)} className="editable-input data-type-number" style={{ width: '22px' }} />) : (!hideDatatypeNumber && <span className="data-type-number">{layer.datatype_number}</span>)}
                                        </div>
                                    </div>
                                    <div className="layer-icons">
                                        <button className='layer-lock-icon' onClick={() => onToggleLayerLock(layer)}>
                                            <FontAwesomeIcon icon={getLockIcon(layer)} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <input type="file" id="fileInput" onChange={onFileChange} accept=".json" hidden />
                </div>
            )}
        </div>
    );
};

export default SidebarComponent;
