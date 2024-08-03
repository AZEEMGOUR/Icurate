// components/SidebarComponent/LayerList.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faLock } from '@fortawesome/free-solid-svg-icons';

const LayerList = ({
    filteredLayers,
    selectLayer,
    selectedLayer,
    toggleVisibility1,
    getVisibilityIcon,
    handleLayerChange,
    onToggleLayerLock,
    getLockIcon,
    hideLayerName,
    hideDatatypeName,
    hideLayerNumber,
    hideDatatypeNumber,
    selectedRadioButton
}) => (
    <div className="layer-item-container">
        {filteredLayers.map((layer) => (
            <div key={layer.layer_number} className={`layer-item ${layer === selectedLayer ? 'selected-layer' : ''}`} onClick={() => selectLayer(layer)}>
                <div className="color-box" style={{ borderColor: layer.boundaryColor }}>
                    <div className="pattern-box" style={{ backgroundColor: layer.color, backgroundImage: `url(${layer.pattern.type})`, opacity: layer.pattern.opacity }}></div>
                </div>
                <button onClick={() => toggleVisibility1(layer)}>
                    <FontAwesomeIcon icon={getVisibilityIcon(layer)} />
                </button>
                <div className="layer-details">
                    <div className="layer-info">
                        <div className="info-row">
                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'layer_name' && !hideLayerName) ? (
                                <input type="text" value={layer.layer_name} onChange={(e) => handleLayerChange('layer_name', e.target.value)} className="editable-input layer-name" />
                            ) : (
                                !hideLayerName && <span className="layer-name">{layer.layer_name}</span>
                            )}
                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'datatype_name' && !hideDatatypeName) ? (
                                <input type="text" value={layer.datatype_name} onChange={(e) => handleLayerChange('datatype_name', e.target.value)} className="editable-input data-type-name" />
                            ) : (
                                !hideDatatypeName && <span className="data-type-name">{layer.datatype_name}</span>
                            )}
                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'layer_number' && !hideLayerNumber) ? (
                                <input type="number" value={layer.layer_number} onChange={(e) => handleLayerChange('layer_number', e.target.value)} className="editable-input layer-number" />
                            ) : (
                                !hideLayerNumber && <span className="layer-number">{layer.layer_number}</span>
                            )}
                            {selectedRadioButton === 'edit_all' || (selectedRadioButton === 'datatype_number' && !hideDatatypeNumber) ? (
                                <input type="number" value={layer.datatype_number} onChange={(e) => handleLayerChange('datatype_number', e.target.value)} className="editable-input data-type-number" />
                            ) : (
                                !hideDatatypeNumber && <span className="data-type-number">{layer.datatype_number}</span>
                            )}
                        </div>
                    </div>
                    <div className="layer-icons">
                        <button onClick={() => onToggleLayerLock(layer)}>
                            <FontAwesomeIcon icon={getLockIcon(layer)} />
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default LayerList;
