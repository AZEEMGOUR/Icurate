// components/SidebarComponent/LayerForm.js
import React from 'react';

const LayerForm = ({ newLayer, setNewLayer, addLayer, toggleAddLayerForm, patternTypes, showAddLayerForm }) => (
    <>
        <button onClick={toggleAddLayerForm}>Add Layer</button>
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
    </>
);

export default LayerForm;
