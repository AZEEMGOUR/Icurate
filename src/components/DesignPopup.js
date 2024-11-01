import React, { useState } from 'react';
import './DesignPopup.css'; // Import the CSS file

const DesignPopup = ({ isOpen, onClose, onConfirm }) => {
    const [designName, setDesignName] = useState('');

    const handleConfirm = () => {
        if (designName.trim()) {
            onConfirm(designName);
        } else {
            console.error("Design name is empty.");
        }
        onClose();
    };



    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!file) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            let response;
            if (file.name.endsWith('.gds')) {
                response = await fetch('https://chipdesign1.pythonanywhere.com/convert-gds-to-json', {
                    method: 'POST',
                    body: formData,
                });
            } else if (file.name.endsWith('.json')) {
                response = await file.text();  // Read JSON file directly
                response = JSON.parse(response);
            }

            if (response.ok || typeof response === 'object') {
                const jsonData = await response.json();
                addDesignToCanvas(jsonData);  // Load the design into the canvas
                onClose();
            } else {
                alert("Error loading file");
            }
        } catch (error) {
            console.error("Error handling file:", error);
        }
    };

    return isOpen ? (
        <div className="popup-overlay">
            <div className="popup-content">
                <h3>Create New Design</h3>
                <input
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Enter design name"
                />
                <button onClick={handleConfirm}>Create</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    ) : null;
};

export default DesignPopup;
