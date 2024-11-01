import React, { useState } from 'react';
import LabelSettings from './LabelSettings';  // Import your LabelSettings component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faEyeSlash, faLock, faUnlock, faSort, faCog } from '@fortawesome/free-solid-svg-icons';
import './LabelComponent.css';

const LabelComponent = ({ shapes, onEditLabel, onDeleteLabel, onToggleLabelVisibility, onToggleLabelLock, onToggleAllVisibility }) => {
    const [editingId, setEditingId] = useState(null); // Track the editing ID
    const [editingText, setEditingText] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isAscending, setIsAscending] = useState(true);
    const [selectedLabel, setSelectedLabel] = useState(null); // Track the selected label
    const [isSettingsVisible, setIsSettingsVisible] = useState(false); // State to control settings popup visibility

    // Recursive function to fetch labels from shapes and their children
    const getLabelsRecursively = (shapes) => {
        let labels = [];

        shapes.forEach((shape) => {
            // If the shape is a label, add it to the array
            if (shape.type === 'Label') {
                labels.push(shape);
            }

            // If the shape has children (e.g., an instance or group), recursively search through its children
            if (shape.children && Array.isArray(shape.children)) {
                labels = labels.concat(getLabelsRecursively(shape.children));
            }
        });

        return labels;
    };

    // Use the recursive function to get all the labels from the shapes array
    const labels = getLabelsRecursively(shapes);

    const handleEditClick = (id, text) => {
        setEditingId(id); // Set the editing ID to the label being edited
        setEditingText(text); // Set the text to the current label's text
    };

    const handleEditChange = (e) => {
        setEditingText(e.target.value); // Update the editing text state as the user types
    };

    const handleEditSave = () => {
        if (editingId !== null) {
            onEditLabel(editingId, editingText); // Save the edited text for the correct label
            setEditingId(null); // Clear the editing ID after saving
        }
    };

    const filteredLabels = labels.filter(label =>
        label.text.toLowerCase().includes(searchText.toLowerCase())
    );

    const sortedLabels = [...filteredLabels].sort((a, b) => {
        return isAscending
            ? a.text.localeCompare(b.text)
            : b.text.localeCompare(a.text);
    });

    const handleSort = () => {
        setIsAscending(!isAscending);
    };

    const formatCoordinate = (value) => {
        return value.toFixed(2); // Formatting to 2 decimal places
    };

    const handleLabelSelect = (label) => {
        setSelectedLabel(label);
    };

    // Recursive function to find and update the label in the shapes array
    const updateLabelInShapes = (shapes, updatedLabel) => {
        return shapes.map((shape) => {
            if (shape.id === updatedLabel.id) {
                return { ...shape, ...updatedLabel }; // Update the label properties
            } else if (shape.children && Array.isArray(shape.children)) {
                // Recursively update the label in the children
                return { ...shape, children: updateLabelInShapes(shape.children, updatedLabel) };
            }
            return shape;
        });
    };

    // Function to handle updating label from the LabelSettings component
    const handleUpdateLabel = (updatedLabel) => {
        if (selectedLabel) {
            // Log the updated values coming from the popup
            console.log('Updated values from the popup:', updatedLabel);
    
            // Update the selected label's properties in the shapes array
            const updatedShapes = updateLabelInShapes(shapes, { ...selectedLabel, ...updatedLabel });
    
            // Log the updated shapes array after the changes are applied
            console.log('Updated shapes array:', updatedShapes);
    
            onEditLabel(updatedShapes); // Assuming `onEditLabel` will update the entire `shapes` array
        }
    };
    

    return (
        <div>
            <div className="label-controls">
                <input
                    type="text"
                    placeholder="Search Labels..."
                    className="label-search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button onClick={() => onToggleAllVisibility()} className="visibility-button">
                    <FontAwesomeIcon icon={faEyeSlash} />
                </button>
                <button onClick={handleSort} className="sort-button">
                    <FontAwesomeIcon icon={faSort} />
                </button>
                <button onClick={() => setIsSettingsVisible(true)} className="settings-button">
                    <FontAwesomeIcon icon={faCog} />
                </button>
            </div>
            
            {/* Coordinates Display Area */}
            {selectedLabel && (
                <div className="selected-label-coordinates">
                    X: {formatCoordinate(selectedLabel.x)}, Y: {formatCoordinate(selectedLabel.y)}
                </div>
            )}

            <ul>
                {sortedLabels.map((label) => (
                    <li
                        key={label.id}
                        className={`label-item ${selectedLabel && selectedLabel.id === label.id ? 'selected' : ''}`}
                        onClick={() => handleLabelSelect(label)}
                    >
                        {editingId === label.id ? (
                            <input
                                type="text"
                                value={editingText}
                                onChange={handleEditChange}
                                onBlur={handleEditSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                autoFocus
                            />
                        ) : (
                            <div className="label-display">
                                <span
                                    className={`label-text ${!label.isVisible ? '' : 'label-hidden'} ${label.isLocked ? 'label-locked' : ''}`}
                                >
                                    {label.text}
                                </span>
                            </div>
                        )}
                        <div className="label-icons">
                            <button onClick={() => handleEditClick(label.id, label.text)} disabled={label.isLocked}>
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button onClick={() => onToggleLabelVisibility(label.id)} disabled={label.isLocked}>
                                <FontAwesomeIcon icon={label.isVisible ? faEyeSlash : faEye} />
                            </button>
                            <button onClick={() => onToggleLabelLock(label.id)}>
                                <FontAwesomeIcon icon={label.isLocked ? faLock : faUnlock} />
                            </button>
                            <button onClick={() => onDeleteLabel(label.id)} disabled={label.isLocked}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Label Settings Popup */}
            {isSettingsVisible && selectedLabel && (
                <LabelSettings
                    selectedLabel={selectedLabel}
                    onUpdateLabel={handleUpdateLabel}  // Pass the update function
                    onClose={() => setIsSettingsVisible(false)}
                />
            )}
        </div>
    );
};

export default LabelComponent;
