import { v4 as uuidv4 } from 'uuid';
let missingLayerShapes = [];

const radToDeg = (radians) => radians * (180 / Math.PI);
const processShapes = (properties, layerMap, userSize, instanceOrigin = [0, 0], makeInvisible = false) => {
    const shapes = [];


    if (!properties || !Array.isArray(properties)) {
        console.warn("No properties array found for shapes.");
        return shapes;
    }

    properties.forEach((shape) => {
        if (!shape.coordinates || !Array.isArray(shape.coordinates) || shape.coordinates.length < 1) {
            console.warn("Skipping shape with missing coordinates:", shape);
            return;  // Skip this shape if it has no coordinates
        }
        
        // Adjust coordinates based on the instance origin

        let coords = shape.coordinates.map(coord => [
            
            (coord[0] / userSize),  // Adjust X relative to instance origin
            (coord[1] / userSize )   // Adjust relative to the instance's Y origin
        ]);
        console.log('coords of shapes',coords[0], coords[1], coords[2], coords[3])

        console.log("coords", coords[0],  coords[1])
        
        const key = `${shape.layer_number}-${shape.datatype_number}`;
        const matchingLayer = layerMap.get(key);
        
        if (matchingLayer) {
            const color = matchingLayer.color;
            // Inside loadShapesFromFile.js (Add this where other shapes are processed)
            if (shape.type === "Polygon") {
                // Divide the coordinates by userSize for each point
                const points = coords.reduce((acc, coord) => {
                    acc.push(coord[0], -coord[1]); // Adjust X and Y coordinates, with Y inverted
                    return acc;
                }, []);

                
        
                // Create a new shape for the polygon
                const newShape = {
                    id: shape.id || `shape_${uuidv4()}`,
                    type: shape.type,
                    points: points,  // Pass the scaled points directly for the polygon
                    color: color,
                    layerId: String(shape.layer_number),
                    datatypeId: String(shape.datatype_number),
                    visible: true,  // Ensure the visibility is correct
                };
        
                shapes.push(newShape);  // Add the new polygon shape to the shapes array
            }
        

            if (shape.type === "Rectangle") {
                const x = coords[0][0];  // X adjusted relative to instance
                const y = -coords[0][1];  // Y adjusted relative to instance
                console.log('const x, y',x, y)
                const width = Math.abs(coords[2][0] - coords[0][0]);
                const height = Math.abs(coords[2][1] - coords[0][1]);

                if (width <= 0 || height <= 0) {
                    console.warn("Skipping shape with non-positive dimensions:", { width, height, shape });
                    return;
                }

                const newShape = {
                    id: shape.id || `shape_${uuidv4()}`,
                    type: shape.type,
                    x: x,  // X position relative to the instance origin
                    y: y,  // Y position relative to the instance origin
                    width: width,
                    height: -height,
                    color: color,
                    layerId: shape.layer_number,
                    datatypeId: shape.datatype_number,
                    visible: !makeInvisible,  // Shapes in instances are invisible if `makeInvisible` is true
                };

                shapes.push(newShape);
            } else if (shape.type === "Label") {
                const x = coords[0][0];  // X adjusted relative to instance
                const y = -coords[0][1];  // Y adjusted relative to instance

                const newLabel = {
                    id: shape.id || `label_${uuidv4()}`,
                    type: shape.type,
                    text: shape.name,
                    x: x,  // X position relative to the instance origin
                    y: y,  // Y position relative to the instance origin
                    rotation: shape.rotation || 0,
                    layerId: String(shape.layer_number),
                    datatypeId: String(shape.datatype_number),
                    fontSize: 16,                // Default font size
                    fontFamily: 'Arial',
                    color: color,
                    visible: shape.visible !== undefined ? shape.visible : !makeInvisible  // Ensure visibility is always defined
                };

                shapes.push(newLabel);
            }
        } else {
            if (shape.layer_number !== undefined && shape.datatype_number !== undefined) {
                // Push missing layer information (layer number and datatype number) directly to global array
                missingLayerShapes.push({
                    layer_number: shape.layer_number,
                    datatype_number: shape.datatype_number
                });
            }
            console.warn(`Skipping shape: No matching layer found for layer_number ${shape.layer_number} and datatype_number ${shape.datatype_number}`);
        }
    });

    return shapes;
};


const processChildShapes = (properties, layerMap, userSize, instanceOrigin = [0, 0], makeInvisible = false) => {
    const childShapes = [];

    if (!properties || !Array.isArray(properties)) {
        console.warn("No properties array found for child shapes.");
        return childShapes;
    }

    properties.forEach((shape) => {
        if (!shape.coordinates || !Array.isArray(shape.coordinates) || shape.coordinates.length < 1) {
            console.warn("Skipping shape with missing coordinates:", shape);
            return;  // Skip this shape if it has no coordinates
        }

        // Adjust coordinates relative to the instance origin
        let coords = shape.coordinates.map(coord => [
            (coord[0] / userSize) + instanceOrigin[0],  // Adjust X relative to instance origin
            (coord[1] / userSize) + instanceOrigin[1]   // Adjust Y relative to instance origin
        ]);

        console.log('child instance origin', instanceOrigin[0], instanceOrigin[1])

        const key = `${shape.layer_number}-${shape.datatype_number}`;
        const matchingLayer = layerMap.get(key);

        if (matchingLayer) {
            const color = matchingLayer.color;

            if (shape.type === "Polygon") {
                // Correctly adjust the points based on instance origin
                const points = coords.reduce((acc, coord) => {
                    acc.push(coord[0], -coord[1]); // Adjust X and Y coordinates, Y is inverted
                    return acc;
                }, []);

                console.log('Child Polygon Points:', points);  // Log to verify correct points

                // Create a new polygon shape
                const newShape = {
                    id: shape.id || `child_shape_${uuidv4()}`,
                    type: shape.type,
                    points: points,  // Pass the scaled points directly for the polygon
                    color: color,
                    layerId: String(shape.layer_number),
                    datatypeId: String(shape.datatype_number),
                    visible: !makeInvisible,  // Child shapes in instances can be made invisible if required
                };

                childShapes.push(newShape);  // Add the new polygon shape to the childShapes array
            }


            if (shape.type === "Rectangle" ) {
                //console.log("nested rectangles coordinates",properties)
                const x = coords[0][0];  // X adjusted relative to instance
                const y = -coords[0][1];  // Y adjusted relative to instance
                //console.log('childe shape x and y', x ,y)
                const width = Math.abs(coords[2][0] - coords[0][0]);
                const height = Math.abs(coords[2][1] - coords[0][1]);

                if (width <= 0 || height <= 0) {
                    console.warn("Skipping shape with non-positive dimensions:", { width, height, shape });
                    return;
                }

                const newShape = {
                    id: shape.id || `child_shape_${uuidv4()}`,
                    type: shape.type,
                    x: x,  // X position relative to the instance origin
                    y: y,  // Y position relative to the instance origin
                    width: width,
                    height: -height,
                    color: color,
                    layerId: String(shape.layer_number),
                    datatypeId: String(shape.datatype_number),
                    visible: !makeInvisible,  // Child shapes in instances can be made invisible if required
                };

                childShapes.push(newShape);
            } else if (shape.type === "Label") {
                const x = coords[0][0];  // X adjusted relative to instance
                const y = -coords[0][1];  // Y adjusted relative to instance

                const newLabel = {
                    id: shape.id || `label_${uuidv4()}`,
                    type: shape.type,
                    text: shape.name,
                    x: x,  // X position relative to the instance origin
                    y: y,  // Y position relative to the instance origin
                    rotation: shape.rotation || 0,
                    layerId: String(shape.layer_number),
                    datatypeId: String(shape.datatype_number),
                    fontSize: 16,                // Default font size
                    fontFamily: 'Arial',
                    color: color,
                    visible: shape.visible !== undefined ? shape.visible : !makeInvisible  // Ensure visibility is always defined
                };

                childShapes.push(newLabel);
            }
        } else {
            if (shape.layer_number !== undefined && shape.datatype_number !== undefined) {
                // Push missing layer information (layer number and datatype number) directly to global array
                missingLayerShapes.push({
                    layer_number: shape.layer_number,
                    datatype_number: shape.datatype_number
                });
            }
            console.warn(`Skipping shape: No matching layer found for layer_number ${shape.layer_number} and datatype_number ${shape.datatype_number}`);
        }
    });

    return childShapes;
};





// Updated processInstance function
const processInstance = (shape, layoutData, layerMap, userSize, parentOrigin = [0, 0], processedInstances, makeInvisible=false, ) => {
    const instanceKey = `${shape.name}-${shape.origin[0][0]}-${shape.origin[0][1]}`;
    
    // Adjust instance origin relative to parent instance origin
    const instanceOriginX = (shape.origin[0][0] / userSize) + parentOrigin[0];
    const instanceOriginY = (shape.origin[0][1] / userSize) + parentOrigin[1]; // No need to invert here if the inversion is applied elsewhere
    //console.log('instanceorigin',shape.name, instanceOriginX, instanceOriginY);  // Removed inversion on Y here

    // Find the corresponding cell for this instance by the name
    const matchingCell = layoutData.layout_data.cells.find(c => c.cell_name === shape.name);



    // const instanceRotationInDegrees = radToDeg(instanceRotationInRadians);
    // if (instanceRotationInDegrees !== 0) {
    //         coords = coords.map(coord => rotatePoint(coord, instanceOrigin, instanceRotationInDegrees));
    //     }
    if (!matchingCell || !Array.isArray(matchingCell.properties)) {
        console.warn("No matching cell or properties found for instance:", shape.name);
        return null;
    }
    const adjustedBoundingBoxX = Math.min(shape.bounding_box[0][0], shape.bounding_box[1][0]) / userSize;
    const adjustedBoundingBoxY = Math.min(shape.bounding_box[0][1], shape.bounding_box[1][1]) / userSize;
    const width = Math.abs((shape.bounding_box[1][0] - shape.bounding_box[0][0]) / userSize);
    const height = Math.abs((shape.bounding_box[1][1] - shape.bounding_box[0][1]) / userSize);
    
    //console.log('instance bbox', shape.bounding_box);

    // Create the instance without the child shapes
    const newInstance = {
        id: shape.id || `instance_${uuidv4()}`,
        type: 'Group',
        name: shape.name,
        x: adjustedBoundingBoxX,  // X position of the instance origin
        y: -adjustedBoundingBoxY,  // Y position of the instance origin
        width: width,
        height: -height,
        stroke: 'blue',
        opacity: 0.3,
        //rotation:rotationInDegrees,
        layerId: String(shape.layer_number),
        datatypeId: String(shape.datatype_number),
        nameVisible: true,

        visible: shape.visible !== undefined ? shape.visible : !makeInvisible ,  // Instance bounding box is visible
        children: []  // Instance starts without children
    };

    processedInstances.set(instanceKey, newInstance);  // Store the processed instance

    

    // Add the child shapes group to this instance's group
    const childShapesGroup = processChildShapes(matchingCell.properties, layerMap, userSize, [instanceOriginX, instanceOriginY], true);
    newInstance.children.push(...childShapesGroup);  // Add all child shapes

    // Recursively process nested instances and add them to the group
    matchingCell.properties.forEach((nestedShape) => {
        if (nestedShape.type === "Instance") {
            const nestedInstance = processInstance(nestedShape, layoutData, layerMap, userSize, [instanceOriginX, instanceOriginY], processedInstances);
            if (nestedInstance) {
                nestedInstance.visible = false;
                newInstance.children.push(nestedInstance);  // Add nested instance as a child
            }
        }
    });

    // Add the group containing all child shapes and instances to the instance
    //newInstance.children.push(instanceGroup);

    return newInstance;
};




const getFirstTopLevelCell = (layoutData) => {
    if (!layoutData || !layoutData.cells || !Array.isArray(layoutData.cells)) {
        console.error("Invalid layout data or missing cells property.");
        return null;
    }

    const instanceNames = new Set();
    const cellNames = new Set();

    // First pass: Collect all cell names
    layoutData.cells.forEach(cell => {
        cellNames.add(cell.cell_name);  // Add all cell names to the set
    });

    // Second pass: Collect all instance names from the properties of each cell
    layoutData.cells.forEach(cell => {
        if (cell.properties) {
            cell.properties.forEach(prop => {
                if (prop.type === "Instance") {
                    instanceNames.add(prop.name);  // Collect instance names
                }
            });
        }
    });

    // Find the first top-level cell (the first cell_name that is not an instance name)
    const firstTopLevelCell = [...cellNames].find(cellName => !instanceNames.has(cellName));

    return firstTopLevelCell;
};

const filterDuplicates = (array) => {
    const uniqueLayers = new Set(array.map(item => `${item.layer_number}-${item.datatype_number}`));
    return [...uniqueLayers].map(item => {
        const [layer_number, datatype_number] = item.split("-");
        return {
            layer_number: parseInt(layer_number, 10),
            datatype_number: parseInt(datatype_number, 10),
        };
    });
};
const downloadJSONFile = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2); // Convert the data to a JSON string
    const blob = new Blob([jsonStr], { type: "application/json" }); // Create a Blob from the string
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    const a = document.createElement("a"); // Create a new anchor element
    a.href = url; // Set the href to the Blob URL
    a.download = filename; // Set the download attribute to the desired filename
    document.body.appendChild(a); // Append the anchor to the body
    a.click(); // Programmatically click the anchor to trigger the download
    document.body.removeChild(a); // Remove the anchor from the DOM
    URL.revokeObjectURL(url); // Revoke the Blob URL to free up memory
};

const loadShapesFromFile = async (event, setShapes, layers, setLayerVisibility, setTopcellname, setMissingLayers) => {
    if (!layers || !Array.isArray(layers)) {
        console.error("Layers is undefined or not an array");
        return;
    }
    missingLayerShapes = [];

    const input = event.target;
    if (input && input.files && input.files.length) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const layoutData = JSON.parse(reader.result);

            if (!layoutData || !layoutData.layout_data || !Array.isArray(layoutData.layout_data.cells)) {
                console.warn("Invalid layout data or missing cells property.");
                return;
            }

            const userSize = layoutData.layout_data.units.user_size || 1;

            const firstTopLevelCell = getFirstTopLevelCell(layoutData.layout_data);
            console.log("Top-level cell:", firstTopLevelCell);
            setTopcellname(firstTopLevelCell);

            const layerMap = new Map();
            layers.forEach(layer => {
                const key = `${layer.layer_number}-${layer.datatype_number}`;
                layerMap.set(key, layer);
            });

            const shapes = [];
            const processedInstances = new Map();
            const missingLayers = new Set();  // To store missing layer info

            // Find the top-level cells
            const instanceNames = new Set();
            layoutData.layout_data.cells.forEach(cell => {
                cell.properties.forEach(prop => {
                    if (prop.type === "Instance") {
                        instanceNames.add(prop.name);  // Add instance names to check
                    }
                });
            });

            const topLevelCells = layoutData.layout_data.cells.filter(cell => !instanceNames.has(cell.cell_name));

            // Process the top-level cells
            topLevelCells.forEach((cell) => {
                cell.properties.forEach(shape => {
                    const key = `${shape.layer_number}-${shape.datatype_number}`;

                    // Check if the layer is missing
                    if (!layerMap.has(key)) {
                        missingLayers.add({
                            layer_number: shape.layer_number,
                            datatype_number: shape.datatype_number
                        });
                    } else {
                        const cellShapes = processShapes([shape], layerMap, userSize);  // Process shapes that have matching layers
                        shapes.push(...cellShapes);  // Add top-level shapes
                    }
                });

                // Process instances within top-level cells
                cell.properties.forEach((shape) => {
                    if (shape.type === "Instance") {
                        const newInstance = processInstance(shape, layoutData, layerMap, userSize, [0, 0], processedInstances);
                        if (newInstance) {
                            shapes.push(newInstance);  // Add top-level instances
                        }
                    }
                });
            });
            const uniqueMissingLayers = filterDuplicates(missingLayerShapes);
            setMissingLayers(uniqueMissingLayers);

            console.log('Unique missing layers:', uniqueMissingLayers);

            console.log("Shapes loaded:", shapes);
            setShapes(shapes);  // Only top-level shapes and instances are passed
            //downloadJSONFile(shapes, "arrayformate")

            if (missingLayers.size > 0) {
                console.log("Missing layers:", Array.from(missingLayers));
                //setMissingLayers(Array.from(missingLayers));  // Pass missing layers
            }
        };

        reader.readAsText(file);
    } else {
        console.error("No files selected or input target is undefined.");
    }
};

export default loadShapesFromFile;
