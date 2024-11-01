import React, { useState, useEffect, useRef } from 'react';
import './CanvasToolbarComponent.css';
import Icon from '@mui/material/Icon';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import FlipIcon from '@mui/icons-material/Flip';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Import dropdown arrow icon
import { v4 as uuidv4 } from 'uuid';
import AppsIcon from '@mui/icons-material/Apps';
import { updateVisibilityBasedOnHierarchy } from '../canvasComponent/operations/updateHierarchyVisibility';

const CanvasToolbarComponent = ({
    onDeleteClick,
    onCopyClick,
    onPastClick,
    onSaveClick,
    onLoadClick,
    onCropClick,
    onFitToScreenClick,
    projectName,
    savedDesigns,
    onProjectNameChange,
    onNewDesignClick,
    onDeleteDesignClick,
    onDirectorySelect,
    addDesignToHierarchy,
    canvasRef, onSaveAsGDSClick
}) => {
    const [selectedDesign, setSelectedDesign] = useState(projectName);
    const [searchQuery, setSearchQuery] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [saveMenuVisible, setSaveMenuVisible] = useState(false);
    const [saveAsSubmenuVisible, setSaveAsSubmenuVisible] = useState(false);
    const dropdownRef = useRef(null);
    const saveMenuRef = useRef(null);
    const [firstInput, setFirstInput] = useState(0);
    const [secondInput, setSecondInput] = useState(0);
    const [showGrid, setShowGrid] = useState(false);
    const [gridPosition, setGridPosition] = useState({ top: 0, left: 0 });
    const appsIconRef = useRef(null);


    

    

    useEffect(() => {
        setSelectedDesign(projectName);
    }, [projectName]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
            if (saveMenuRef.current && !saveMenuRef.current.contains(event.target)) {
                setSaveMenuVisible(false);
                setSaveAsSubmenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // useEffect(() => {
    //     const updatedShapes = updateVisibilityBasedOnHierarchy(shapes, currentLevel, targetLevel);
    //     setShapes(updatedShapes);
    // }, [fir, targetLevel, shapes, setShapes]);



    useEffect(() => {
        updateInstanceVisibility(firstInput, secondInput);
    }, [firstInput, secondInput]);
    

    // // Update currentLevel and targetLevel based on user interaction
    // const handleLevelChange = (e) => {
    //     const { name, value } = e.target;
    //     if (name === 'currentLevel') {
    //         setCurrentLevel(parseInt(value));
    //     } else if (name === 'targetLevel') {
    //         setTargetLevel(parseInt(value));
    //     }
    // }

    const handleProjectNameChange = async (event) => {
        const newName = event.target.value;
        setSelectedDesign(newName); // Set the selected design in the display area
        setDropdownVisible(false); // Hide dropdown after selection
        
        await onProjectNameChange(newName);
        
        // Update the hierarchy with the new design name
        addDesignToHierarchy({
            id: uuidv4(), // Ensure each design has a unique ID
            name: newName, // Pass the design name correctly
            children: [] // Initialize with no children
        });
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const handleDropdownToggle = () => {
        setDropdownVisible(!dropdownVisible); // Toggle dropdown visibility
    };

    const handleSaveMenuToggle = () => {
        setSaveMenuVisible(!saveMenuVisible);
        setSaveAsSubmenuVisible(false); // Ensure submenu is hidden initially
    };

    const handleSaveAsHover = () => {
        setSaveAsSubmenuVisible(true); // Show Save As submenu
    };

    const filteredDesigns = savedDesigns.filter(design =>
        design.toLowerCase().includes(searchQuery)
    );
    const handleSaveAsGDS = async () => {
      if (canvasRef.current) {
          const shapes = canvasRef.current.getShapes();
          const directoryHandle = await canvasRef.current.getDirectoryHandle();
  
          if (shapes && directoryHandle) {
              const jsonContent = JSON.stringify(shapes);
  
              console.log("Shapes:", shapes);
              console.log("Directory Handle:", directoryHandle);
  
              try {
                  const response = await fetch('http://127.0.0.1:5000/convert-to-gds', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                          json_content: jsonContent,
                          directory_handle: directoryHandle.name, // Make sure you are passing the correct value here
                      }),
                  });
  
                  const data = await response.json();
  
                  if (response.ok) {
                      console.log('GDS file saved at:', data.gds_file);
                      alert('GDS file saved successfully at ' + data.gds_file);
                  } else {
                      console.error('Error:', data.message);
                      alert('Error saving GDS file: ' + data.message);
                  }
              } catch (error) {
                  console.error('Request failed:', error);
                  alert('Request failed: ' + error);
              }
          } else {
              alert('No shapes to save or no directory selected.');
          }
      }
  };


  const handleUndoClick = () => {
    if (canvasRef.current) {
        canvasRef.current.undo();  // Call the undo function
    }
};

const handleRedoClick = () => {
    if (canvasRef.current) {
        canvasRef.current.redo();  // Call the redo function
    }
};
  
  
  
const updateInstanceVisibility = (firstLevel, secondLevel) => {
    if (canvasRef.current) {
        canvasRef.current.setInstanceVisibility(firstLevel, secondLevel);
    }
};

const handleFirstInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFirstInput(value);
    updateInstanceVisibility(value, secondInput);
};

const handleSecondInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSecondInput(value);
    updateInstanceVisibility(firstInput, value);
};

const toggleGrid = () => {
    if (appsIconRef.current) {
        const rect = appsIconRef.current.getBoundingClientRect();
        let top = rect.bottom;
        let left = rect.left - 40; // Adjust the left position as needed

        // Ensure the grid panel does not overflow the window width
        const gridWidth = 140; // Adjust based on the actual width of your grid panel
        if (left + gridWidth > window.innerWidth) {
            left = window.innerWidth - gridWidth - 20; // 20px for padding/margin
        }

        setGridPosition({ top, left });
    }
    setShowGrid(!showGrid);
};





    return (
        <div className="canvas-toolbar">
            {/* Toolbar buttons */}
            <button className="mat-icon-button">
                <img src="assets/logo1.png" className="custom-icon" alt="logo" />
            </button>

            <button className="mat-icon-button" onClick={onDirectorySelect}>
                <Icon>folder_open</Icon>
            </button>

            <button className="mat-icon-button" onClick={onNewDesignClick}>
                <Icon>add</Icon>
            </button>

            {/* Save button with dropdown */}
            <div className="save-menu-container" ref={saveMenuRef}>
                <button className="mat-icon-button" onClick={handleSaveMenuToggle}>
                    <Icon>save</Icon>
                </button>
                {saveMenuVisible && (
                    <div className="save-menu">
                        <div className="save-menu-item" onClick={onSaveClick}>Save</div>
                        <div
                            className="save-menu-item"
                            onMouseEnter={handleSaveAsHover}
                        >
                            Save As
                            <ArrowDropDownIcon className="submenu-arrow" />
                            {saveAsSubmenuVisible && (
                                <div className="save-as-submenu">
                                    <div className="submenu-item" onClick={onSaveAsGDSClick}>GDS</div>
                                    <div className="submenu-item" onClick={() => onSaveClick('json')}>JSON</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button className="mat-icon-button" onClick={handleUndoClick}>
                <Icon>undo</Icon>
            </button>

            <button className="mat-icon-button" onClick={handleRedoClick}>
                <Icon>redo</Icon>
            </button>

            <button className="mat-icon-button">
                <Icon>edit</Icon>
            </button>

            <button className="mat-icon-button" onClick={onCopyClick}>
                <Icon>content_copy</Icon>
            </button>

            <button className="mat-icon-button" onClick={onPastClick}>
                <Icon>content_paste</Icon>
            </button>

            <button className="mat-icon-button" onClick={() => canvasRef.current.activateFitToScreen()}>
                <Icon>fit_screen</Icon>
            </button>
      
            <button className="mat-icon-button">
                <Icon>call_split</Icon>
            </button>

            <button className="mat-icon-button">
                <Icon>functions</Icon>
            </button>

            <button className="mat-icon-button">
                <Icon>format_list_bulleted</Icon>
            </button>

            <button className="mat-icon-button">
                <Icon>border_all</Icon>
            </button>

            <button className="mat-icon-button" onClick={onDeleteClick}>
                <Icon>delete</Icon>
            </button>
                                   
            <button className="mat-icon-button">
                <Icon>select_all</Icon>
            </button>

            <button className="mat-icon-button" onClick={onCropClick}>
                <Icon>crop</Icon>
            </button>

            

            <button className="mat-icon-button">
                <Icon>rotate_right</Icon>
            </button>

            <button
                className="mat-icon-button"
                onClick={() => canvasRef.current.flipSelectedShapesX()}
                title="Flip X-Axis"
            >
                <FlipIcon />
            </button>

            <button
                className="mat-icon-button"
                onClick={() => canvasRef.current.flipSelectedShapesY()}
                title="Flip Y-Axis"
            >
                <FlipToBackIcon />
            </button>

            {/* Dropdown with selected design display and search inside */}
            <div className="design-dropdown-container" ref={dropdownRef}>
                <div className="selected-design-display" onClick={handleDropdownToggle}>
                    {selectedDesign || 'Select Design'}
                    <ArrowDropDownIcon className="dropdown-arrow" />
                </div>
                {dropdownVisible && (
                    <div className="design-dropdown show">
                        <input
                            type="text"
                            placeholder="Search Designs..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <div className="custom-scrollbar">
                            <select
                                value={selectedDesign || ''}
                                onChange={handleProjectNameChange}
                                size={Math.min(filteredDesigns.length, 10)} /* Size limits the visible options */
                            >
                                {filteredDesigns.length > 0 ? (
                                    filteredDesigns.map((design, index) => (
                                        <option key={index} value={design}>
                                            {design}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No designs available</option>
                                )}
                            </select>
                        </div>
                    </div>
                )}
                <input
                type="number"
                value={firstInput}
                onChange={handleFirstInputChange}
                placeholder="First Input"
            />
            <input
                type="number"
                value={secondInput}
                onChange={handleSecondInputChange}
                placeholder="Second Input"
            />
            </div>
            <button ref={appsIconRef} className="mat-icon-button" onClick={toggleGrid}>
                <AppsIcon />
            </button>

            {showGrid && (
                <div className="grid-panel" style={{ top: `${gridPosition.top}px`, left: `${gridPosition.left}px`, zIndex: 2000 }}>
                    <div className="grid-item">
                        <label className="square-button">
                            <input type="file" style={{ display: 'none' }} />
                            Upload 1
                        </label>
                    </div>
                    <div className="grid-item">
                        <label className="square-button">
                            <input type="file" style={{ display: 'none' }} />
                            Upload 2
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CanvasToolbarComponent;
