import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight, faCaretDown, faEye, faEyeSlash, faLock, faUnlock, faTrash, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
import './HierarchyComponent.css';
import InstanceSettingsPopup from './InstanceSettingsPopup';

const HierarchyComponent = ({ addDesignToHierarchy, shapes, toggleShapeVisibility, addInstance, handleInstanceSelect, onEndValueChange, projectName, addDesignToCanvas, topcellname, setShapes }) => {
  const [expandedInstances, setExpandedInstances] = useState({});
  const [hoveredInstance, setHoveredInstance] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [xCoord, setXCoord] = useState('');
  const [yCoord, setYCoord] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [isTopCellExpanded, setIsTopCellExpanded] = useState(false); // State to toggle top cell hierarchy
  //const [popupVisible1, setPopupVisible] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [settingsPopupVisible, setSettingsPopupVisible] = useState(false);
  const [locked, setunlocked] = useState(false);

  // Toggle instance expansion
  const toggleInstanceExpansion = (instanceId) => {
    setExpandedInstances((prevState) => ({
      ...prevState,
      [instanceId]: !prevState[instanceId],
    }));
  };

  // Toggle top-level cell expansion
  const toggleTopCellExpansion = () => {
    setIsTopCellExpanded(!isTopCellExpanded);
  };

  // Handle double-click on instance for toggling visibility
  const handleInstanceDoubleClick = (instanceId) => {
    toggleShapeVisibility(instanceId); // Toggle based on endValue
  };

  const handleInstanceVisibilityToggle = (instanceId) => {
    toggleShapeVisibility(instanceId); // This will call the function from App.js or CanvasComponent.js
  };

  const handleMouseEnter = (instanceId) => {
    setHoveredInstance(instanceId); // Set the hovered instance
  };
  
  const handleMouseLeave = () => {
    setHoveredInstance(null); // Clear hovered instance when leaving
  };

  

  // Render hierarchy of instances
  const renderInstancesInHierarchy = (shapesArray) => {
    return shapesArray
      .filter((shape) => shape.type === 'Group') // Filter only instances (Groups)
      .map((instance) => {
        const hasChildren = instance.children && instance.children.some((child) => child.type === 'Group');
        const isExpanded = expandedInstances[instance.id];

        return (
          <div key={instance.id} className="instance-container">
            <div
              className={`instance-item ${isExpanded ? 'expanded' : ''}`}
              onDoubleClick={() => handleInstanceDoubleClick(instance.id)}
              onMouseEnter={() => handleMouseEnter(instance.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="instance-name-wrapper">
                {hasChildren && (
                  <FontAwesomeIcon
                    icon={isExpanded ? faCaretDown : faCaretRight}
                    onClick={() => toggleInstanceExpansion(instance.id)}
                  />
                )}
                <span className="instance-name">
                  {instance.name || `Instance ${instance.id}`}
                </span>
              </div>

              {hoveredInstance === instance.id && (
                <div className="instance-actions">
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="action-icon"
                    onClick={() => addInstance(instance.id)}
                  />
                  <FontAwesomeIcon
                    icon={instance.visible ? faEyeSlash : faEye}
                    className="action-icon"
                    onClick={() => handleInstanceVisibilityToggle(instance.id)}
                  />
                  <FontAwesomeIcon icon={instance.locked ? faLock : faUnlock}  onClick={() => handleLockToggle(instance.id)} className="action-icon" />
                  <FontAwesomeIcon icon={faTrash} onClick={() => deleteShape(instance.id)} className="action-icon" />
                </div>
              )}
            </div>

            {isExpanded && instance.children && instance.children.length > 0 && (
              <div className="subinstance-container">
                {renderInstancesInHierarchy(instance.children.filter((child) => child.type === 'Group'))} {/* Render only groups */}
              </div>
            )}
          </div>
        );
      });
  };
  
  // Open the popup when browse button is clicked
  const handleOpenPopup = () => {
    setPopupVisible(true);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };


  const handleLockToggle = (instanceId) => {
    const updatedShapes = shapes.map(shape => 
      shape.id === instanceId ? { ...shape, locked: !shape.locked } : shape
    );
    setunlocked(true)
    setShapes(updatedShapes);

  };

  const deleteShape = (shapeId) => {
    setShapes(prevShapes => prevShapes.filter(shape => shape.id !== shapeId));
  };

  // Close the popup
  const handleClosePopup = () => {
    setPopupVisible(false);
    setXCoord('');
    setYCoord('');
    setSelectedFile(null);
  };

  const handleAddDesign = () => {
    if (selectedFile) {
      const fileData = {
        file: selectedFile,
        x: parseFloat(xCoord),
        y: parseFloat(yCoord),
      };
  
      // Call addDesignToCanvas to load the design on the canvas
      addDesignToCanvas(fileData);
  
      // Handle the hierarchy
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const newDesignData = JSON.parse(content);
  
        // Assuming there might be multiple sub-top cells in the new design
        if (newDesignData.layout_data?.cells) {
          newDesignData.layout_data.cells.forEach((cell) => {
            // Get each sub-top cell from the new design
            const subTopCellName = cell.cell_name || 'Unknown Sub-Top Cell';
  
            // Add the new sub-top cell under the existing top-level cell (e.g., INV)
            addDesignToHierarchy(subTopCellName, topcellname);  // Add sub-top cell under the current topcellname
  
            // Now fetch the instances for this sub-top cell
            const fetchedInstances = [];
            if (cell.properties) {
              cell.properties.forEach((prop) => {
                if (prop.type === 'Instance') {
                  fetchedInstances.push(prop); // Collect instances for this sub-top cell
                }
              });
            }
  
            // Add each instance under the respective sub-top cell in the hierarchy
            fetchedInstances.forEach((instance) => {
              addDesignToHierarchy(instance.name, subTopCellName);
            });
          });
        }
      };
  
      reader.readAsText(selectedFile);  // Read the selected JSON file
      handleClosePopup();  // Close the popup after processing
    } else {
      alert('Please select a file!');
    }
  };

  // Handle X and Y input change
  const handleXChange = (e) => setXCoord(e.target.value);
  const handleYChange = (e) => setYCoord(e.target.value);

  return (
    <div className="hierarchy-container">
      {/* Open Popup Button */}
      <div className="icons-container">
    <FontAwesomeIcon icon={faPlus} className="plus-icon" onClick={handleOpenPopup} />
    <FontAwesomeIcon
  icon={faCog}
  className="settings-icon"
  onClick={() => setSettingsPopupVisible(true)} // This opens the settings popup
/>
  </div>
       
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        
      </div>
      

      {/* Project name as the root of hierarchy */}
      <div className="instance-structure-container">
        <div className="instance-item project-root" onClick={toggleTopCellExpansion}>
          <div className="instance-name-wrapper">
            <FontAwesomeIcon
              icon={isTopCellExpanded ? faCaretDown : faCaretRight}
            />
            <span className="project-name">{topcellname}</span>
          </div>
        </div>

        {/* Render instances if top cell is expanded */}
        {isTopCellExpanded && (
          <div className="subinstance-container">
            {renderInstancesInHierarchy(shapes)} {/* Instances hierarchy */}
          </div>
        )}
      </div>

      {/* Popup for file selection and X, Y coordinates */}
      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <h4>Select a file and enter X, Y coordinates</h4>

            {/* File input */}
            <div className="file-picker">
              <input
                type="file"
                accept=".json,.gds"
                onChange={handleFileSelect}
              />
              {selectedFile && <p>Selected File: {selectedFile.name}</p>}
            </div>

            {/* X, Y input */}
            <label>X:</label>
            <input type="number" value={xCoord} onChange={handleXChange} />
            <label>Y:</label>
            <input type="number" value={yCoord} onChange={handleYChange} />

            <button onClick={handleAddDesign}>Add Design</button> {/* Add Design Button */}
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
      {settingsPopupVisible && (
  <InstanceSettingsPopup
    selectedInstance={selectedInstance}
    isVisible={settingsPopupVisible}
    onClose={() => setSettingsPopupVisible(false)}
  />
)}
    </div>
  );
};

export default HierarchyComponent;
