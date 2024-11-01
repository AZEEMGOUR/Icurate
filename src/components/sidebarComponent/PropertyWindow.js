import { useEffect, useState } from 'react';
import './PropertyWindow.css';

const PropertyWindow = ({ selectedShapes = [], layers = [], onUpdateShape, stageRef, layerRef,setShapes }) => {
  const [rectangleIndex, setRectangleIndex] = useState(0);
  const [instanceIndex, setInstanceIndex] = useState(0);
  const [labelIndex, setLabelIndex] = useState(0);
  const [rectangles, setRectangles] = useState([]);
  const [instances, setInstances] = useState([]);
  const [labels, setLabels] = useState([]);
  const [localShapes, setLocalShapes] = useState([]); // Store multiple shapes

  useEffect(() => {
    const groupedRectangles = selectedShapes.filter((shape) => shape.type === 'Rectangle');
    const groupedInstances = selectedShapes.filter((shape) => shape.type === 'Group');
    const groupedLabels = selectedShapes.filter((shape) => shape.type === 'Label');
  
    setRectangles(groupedRectangles);
    setInstances(groupedInstances);
    setLabels(groupedLabels);
  
    if (selectedShapes.length !== localShapes.length) {
      setLocalShapes([...selectedShapes]);  // Update only when selectedShapes changes
    }
  
    // Reset indexes only if selected shapes are completely new
    if (selectedShapes.length === 0 || selectedShapes[0].id !== localShapes[0]?.id) {
      setRectangleIndex(0);
      setInstanceIndex(0);
      setLabelIndex(0);
    }
  }, [selectedShapes]);

  // Function to update a specific shape on the Konva canvas
  const updateShapeOnCanvas = (shape, property, value) => {
    if (stageRef && layerRef && shape) {
      const konvaShape = stageRef.current.findOne(`#${shape.id}`);
      if (konvaShape) {
        konvaShape.setAttr(property, value);  // Update the shape's attribute
      }
      layerRef.current.batchDraw();    // Redraw the layer for immediate reflection
    }
  };

  const updateShapeInArray = (shapeId, property, value) => {
    setShapes(prevShapes =>
      prevShapes.map(shape => 
        shape.id === shapeId ? { ...shape, [property]: value } : shape
      )
    );
  };

  // Handle input changes and update only the currently selected shape in the property window
  const handleInputChange = (property, value, index, shapeType) => {
    const updatedValue = parseFloat(value);

    // Update only the specific shape based on the current index
    const updatedShapes = localShapes.map((shape, i) => {
      if (
        (shapeType === 'Rectangle' && i === rectangleIndex) ||
        (shapeType === 'Group' && i === instanceIndex) ||
        (shapeType === 'Label' && i === labelIndex)
      ) {
        const updatedShape = {
          ...shape,
          [property]: updatedValue
        };

        // Update the shape on the canvas
        updateShapeOnCanvas(updatedShape, property, updatedValue);


        //onUpdateShape(shape.id, property, updatedValue);

        return updatedShape;
      }
      return shape;
    });

    setLocalShapes(updatedShapes); // Update localShapes with the new values
  };

  const handleBlur = (shapeId, property, value) => {
    onUpdateShape(shapeId, property, value);  // Now update the global shapes array
  };

  const findMatchingLayer = (shape) => {
    return layers.find(
      (layer) =>
        layer.layer_number.toString() === shape.layerId &&
        layer.datatype_number.toString() === shape.datatypeId
    );
  };

  const CustomDropdown = ({ layers, selectedLayer, onLayerChange }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleDropdown = () => setIsOpen(!isOpen);
    const handleLayerSelect = (layer) => {
      onLayerChange(layer);
      setIsOpen(false);
    };
  
    return (
      <div className="dropdown-container" style={{ position: 'relative', zIndex: 100 }}>
        {/* Selected Layer */}
        <div
          className="dropdown-header"
          onClick={toggleDropdown}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '5px', backgroundColor: '#333', color: '#fff' }}
        >
          <span
            style={{
              width: '18px',
              height: '18px',
              backgroundColor: selectedLayer?.color || '#CCC',
              marginRight: '8px',
              borderRadius: '3px',
            }}
          ></span>
          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
            <span>{selectedLayer?.layer_name || 'No Layer'}</span>
            <span>{selectedLayer?.datatype_name || 'No Data'}</span>
            <span>{`${selectedLayer?.layer_number || 0} ${selectedLayer?.datatype_number || 0}`}</span>
          </div>
        </div>
  
        {/* Dropdown List */}
        {isOpen && layers.length > 0 && (
          <div
            className="dropdown-list"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              backgroundColor: '#333',
              border: '1px solid #555',
              zIndex: 100,
              maxHeight: '250px', // Set a fixed max height for the dropdown list
              overflowY: 'auto',  // Enable vertical scrolling when content exceeds the height
            }}
          >
            {layers.map((layer) => (
              <div
                key={`${layer.layer_number}-${layer.datatype_number}`}
                onClick={() => handleLayerSelect(layer)}
                style={{
                  padding: '3px 5px',
                  display: 'grid',
                  gridTemplateColumns: '20px 40px 70px 50px',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: '10px'
                }}
              >
                {/* Color Box */}
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    backgroundColor: layer.color,
                    borderRadius: '3px',
                  }}
                ></span>
                {/* Layer Info */}
                <span style={{ width: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{layer.layer_name}</span>
                <span style={{ width: '70px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{layer.datatype_name}</span>
                <span>{`${layer.layer_number}/${layer.datatype_number}`}</span> {/* Space between numbers */}
              </div>
            ))}
          </div>
        )}
  
        {/* Fallback if no layers are available */}
        {isOpen && layers.length === 0 && <p style={{ padding: '5px', color: 'white' }}>No layers available</p>}
      </div>
    );
  };
  
  
  
  

  const renderLayerDropdown = (shape,  onLayerChange) => {
    // Remove early return so dropdown still renders even if layers are not yet available
    const selectedLayer = layers.find(
      (layer) =>
        layer.layer_number.toString() === shape.layerId &&
        layer.datatype_number.toString() === shape.datatypeId
    );
    
  
    const defaultLayer = layers[0] || { layer_name: 'Loading...', color: '#CCC', layer_number: 0, datatype_number: 0 };
  
    return (
      <CustomDropdown
        layers={layers.length > 0 ? layers : [defaultLayer]}  // Show default layer while loading
        selectedLayer={selectedLayer || defaultLayer}  // Default layer for initial loading state
        onLayerChange={(layer) => {
          onLayerChange(shape, `${layer.layer_number}-${layer.datatype_number}`);
        }}
      />
    );
  };
  
  
  
  
  
  
  // Render properties for a single Rectangle
  const renderRectangleProperties = (shape) => {
    const matchingLayer = findMatchingLayer(shape);

    return (
      <div key={shape.id} className="property-group">
        <div className="property-header">
          <div className="property-title rectangle">Rectangle</div>
        </div>
        {/* Render the layer dropdown here */}
      <div className="property-item">
        
        {renderLayerDropdown(shape, handleLayerChange)}
         {/* Dropdown for layer */}
      </div>

        

        {/* x-coordinate */}
        
        
        <div className="property-item">
        <label>x-cord</label> 
          <input
            type="number"
            value={shape.x || ''}
            onChange={(e) => handleInputChange('x', e.target.value, rectangleIndex, 'Rectangle')}
            onBlur={(e) => handleBlur(shape.id, 'x', e.target.value)}
          />
        </div>

        {/* y-coordinate */}
        
        <div className="property-item">
        <label>y-cord</label>
          <input
            type="number"
            value={shape.y || ''}
            onChange={(e) => handleInputChange('y', e.target.value, rectangleIndex, 'Rectangle')}
            onBlur={(e) => handleBlur(shape.id, 'y', e.target.value)}
          />
        </div>

        {/* Width */}
        
        <div className="property-item">
        <label>Width</label>
          <input
            type="number"
            value={shape.width || ''}
            onChange={(e) => handleInputChange('width', e.target.value, rectangleIndex, 'Rectangle')}
            onBlur={(e) => handleBlur(shape.id, 'width', e.target.value)} 
          />
        </div>

        {/* Height */}
        
        <div className="property-item">
        <label>Height</label>
          <input
            type="number"
            value={shape.height || ''}
            onChange={(e) => handleInputChange('height', e.target.value, rectangleIndex, 'Rectangle')}
            onBlur={(e) => handleBlur(shape.id, 'height', e.target.value)}
          />
        </div>
      </div>
    );
  };

  // Render properties for a single Instance
  const renderInstanceProperties = (shape) => {
    return (
      <div key={shape.id} className="property-group">
        <div className="property-header">
          <div className="property-title instance">Instance</div>
        </div>

        {/* Name */}
        <div className="property-item">Name</div>
        <div className="property-item">
          <input
            type="text"
            value={shape.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value, instanceIndex, 'Group')}
            onBlur={(e) => handleBlur(shape.id, 'name', e.target.value)}
          />
        </div>

        {/* x-coordinate */}
        <div className="property-item">x-cord</div>
        <div className="property-item">
          <input
            type="number"
            value={shape.x || ''}
            onChange={(e) => handleInputChange('x', e.target.value, instanceIndex, 'Group')}
            onBlur={(e) => handleBlur(shape.id, 'x', e.target.value)}
          />
        </div>

        {/* y-coordinate */}
        <div className="property-item">y-cord</div>
        <div className="property-item">
          <input
            type="number"
            value={shape.y || ''}
            onChange={(e) => handleInputChange('y', e.target.value, instanceIndex, 'Group')}
            onBlur={(e) => handleBlur(shape.id, 'y', e.target.value)}
          />
        </div>

        {/* Orientation */}
        <div className="property-item">Orientation</div>
        <div className="property-item">
          <input
            type="text"
            value={shape.orientation || ''}
            onChange={(e) => handleInputChange('orientation', e.target.value, instanceIndex, 'Group')}
            onBlur={(e) => handleBlur(shape.id, 'orientation', e.target.value)}
          />
        </div>
      </div>
    );
  };

  const handleLayerChange = (shape, selectedValue) => {
    const [selectedLayerId, selectedDatatypeId] = selectedValue.split('-'); // Extract selected layer and datatype
    const updatedShape = {
      ...shape,
      layerId: selectedLayerId,
      datatypeId: selectedDatatypeId,
    };
  
    // Update the shape in the canvas and globally
    updateShapeOnCanvas(updatedShape, 'layerId', selectedLayerId);  // Update layerId on canvas
    updateShapeOnCanvas(updatedShape, 'datatypeId', selectedDatatypeId);  // Update datatypeId on canvas
    onUpdateShape(shape.id, 'layerId', selectedLayerId);  // Update shape globally
    onUpdateShape(shape.id, 'datatypeId', selectedDatatypeId);  // Update shape globally
  
    // Update local state to re-render the property window
    setLocalShapes((prevShapes) =>
      prevShapes.map((s) =>
        s.id === shape.id ? updatedShape : s
      )
    );
  };
  

  // Render properties for a single Label
  const renderLabelProperties = (shape) => {
    return (
      <div key={shape.id} className="property-group">
        <div className="property-header">
          <div className="property-title label">Label</div>
        </div>

        {/* Text */}
        <div className="property-item">Name</div>
        <div className="property-item">
          <input
            type="text"
            value={shape.text || ''}
            onChange={(e) => handleInputChange('text', e.target.value, labelIndex, 'Label')}
            onBlur={(e) => handleBlur(shape.id, 'text', e.target.value)}
            
          />
        </div>

        {/* x-coordinate */}
        <div className="property-item">x-cord</div>
        <div className="property-item">
          <input
            type="number"
            value={shape.x || ''}
            onChange={(e) => handleInputChange('x', e.target.value, labelIndex, 'Label')}
            onBlur={(e) => handleBlur(shape.id, 'x', e.target.value)}
          />
        </div>

        {/* y-coordinate */}
        <div className="property-item">y-cord</div>
        <div className="property-item">
          <input
            type="number"
            value={shape.y || ''}
            onChange={(e) => handleInputChange('y', e.target.value, labelIndex, 'Label')}
            onBlur={(e) => handleBlur(shape.id, 'y', e.target.value)}
          />
        </div>

        {/* Font Size */}
        <div className="property-item">Size</div>
        <div className="property-item">
          <input
            type="number"
            value={shape.fontSize || ''}
            onChange={(e) => handleInputChange('fontSize', e.target.value, labelIndex, 'Label')}
            onBlur={(e) => handleBlur(shape.id, 'fontSize', e.target.value)}
          />
        </div>

        {/* Font Family */}
        <div className="property-item">Font</div>
        <div className="property-item">
          <input
            type="text"
            value={shape.fontFamily || ''}
            onChange={(e) => handleInputChange('fontFamily', e.target.value, labelIndex, 'Label')}
            onBlur={(e) => handleBlur(shape.id, 'fontFamily', e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="property-window">
      {/* Rectangle Section */}
      {rectangles.length > 0 && (
        <>
          <div className="property-header">
            <div className="property-title rectangle">Rectangles</div>
            <div className="property-buttons">
              <button onClick={() => setRectangleIndex((i) => (i - 1 + rectangles.length) % rectangles.length)}>
                &#9668;
              </button>
              <span>{rectangleIndex + 1}/{rectangles.length}</span>
              <button onClick={() => setRectangleIndex((i) => (i + 1) % rectangles.length)}>&#9658;</button>
            </div>
          </div>
          {renderRectangleProperties(localShapes[rectangleIndex])} {/* Pass the shape from localShapes */}
        </>
      )}

      {/* Instance Section */}
      {instances.length > 0 && (
        <>
          <div className="property-header">
            <div className="property-title instance">Instances</div>
            <div className="property-buttons">
              <button onClick={() => setInstanceIndex((i) => (i - 1 + instances.length) % instances.length)}>
                &#9668;
              </button>
              <span>{instanceIndex + 1}/{instances.length}</span>
              <button onClick={() => setInstanceIndex((i) => (i + 1) % instances.length)}>&#9658;</button>
            </div>
          </div>
          {renderInstanceProperties(localShapes[instanceIndex])} {/* Pass the shape from localShapes */}
        </>
      )}

      {/* Label Section */}
      {labels.length > 0 && (
        <>
          <div className="property-header">
            <div className="property-title label">Labels</div>
            <div className="property-buttons">
              <button onClick={() => setLabelIndex((i) => (i - 1 + labels.length) % labels.length)}>
                &#9668;
              </button>
              <span>{labelIndex + 1}/{labels.length}</span>
              <button onClick={() => setLabelIndex((i) => (i + 1) % labels.length)}>&#9658;</button>
            </div>
          </div>
          {renderLabelProperties(localShapes[labelIndex])} {/* Pass the shape from localShapes */}
        </>
      )}
    </div>
  );

  
};

export default PropertyWindow;
