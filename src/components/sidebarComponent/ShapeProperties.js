import React, { useEffect, useState } from 'react';
import './PropertyWindow.css';

const PropertyWindow = ({ selectedShapes = [], layers = [], onUpdateShape }) => {
    const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
    const [shapeProperties, setShapeProperties] = useState({});

    useEffect(() => {
        if (selectedShapes.length > 0) {
            setCurrentShapeIndex(0); // Reset to the first shape when new shapes are selected
            setShapeProperties(selectedShapes[0]); // Set shapeProperties to the first shape
        }
    }, [selectedShapes]);

    const handleNextShape = () => {
        if (selectedShapes.length > 0) {
            const nextIndex = (currentShapeIndex + 1) % selectedShapes.length;
            setCurrentShapeIndex(nextIndex);
            setShapeProperties(selectedShapes[nextIndex]);
        }
    };

    const handlePreviousShape = () => {
        if (selectedShapes.length > 0) {
            const prevIndex = (currentShapeIndex - 1 + selectedShapes.length) % selectedShapes.length;
            setCurrentShapeIndex(prevIndex);
            setShapeProperties(selectedShapes[prevIndex]);
        }
    };

    const handleChange = (property, value) => {
        // Update the local shapeProperties state instantly
        const updatedShape = { ...shapeProperties, [property]: value };
        setShapeProperties(updatedShape);

        // Call the update handler immediately to update the shape in the parent component
        onUpdateShape(updatedShape.id, property, value);
    };

    const findMatchingLayer = (shape) => {
        return layers.find(
            (layer) =>
                layer.layer_number.toString() === shape.layerId &&
                layer.datatype_number.toString() === shape.datatypeId
        );
    };

    const renderProperties = (shape) => {
        if (!shape) return null;

        const matchingLayer = findMatchingLayer(shape);

        if (!matchingLayer) {
            return <div>No matching layer found for this shape</div>;
        }

        return (
            <div className="property-group">
                <div className="property-header">
                    <div className="property-title rectangle">Rectangle</div>
                    <div className="property-buttons">
                        <button className="triangle-button" onClick={handlePreviousShape}>&#9668;</button>
                        <span className="property-count">{currentShapeIndex + 1}</span>
                        <button className="triangle-button" onClick={handleNextShape}>&#9658;</button>
                    </div>
                </div>
                <div className="property-item">Layer Name</div>
                <div className="property-item">{matchingLayer.layer_name || '--'}</div>
                <div className="property-item">Datatype Name</div>
                <div className="property-item">{matchingLayer.datatype_name || '--'}</div>
                <div className="property-item">x-cord</div>
                <div className="property-item">
                    <input
                        type="number"
                        value={shapeProperties.x || ''}
                        onChange={(e) => handleChange('x', parseFloat(e.target.value))}
                    />
                </div>
                <div className="property-item">y-cord</div>
                <div className="property-item">
                    <input
                        type="number"
                        value={shapeProperties.y || ''}
                        onChange={(e) => handleChange('y', parseFloat(e.target.value))}
                    />
                </div>
                <div className="property-item">Width</div>
                <div className="property-item">
                    <input
                        type="number"
                        value={shapeProperties.width || ''}
                        onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                    />
                </div>
                <div className="property-item">Height</div>
                <div className="property-item">
                    <input
                        type="number"
                        value={shapeProperties.height || ''}
                        onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="property-window">
            {selectedShapes.length > 0 ? (
                renderProperties(selectedShapes[currentShapeIndex])
            ) : (
                <div>No shapes selected</div>
            )}
        </div>
    );
};

export default PropertyWindow;
