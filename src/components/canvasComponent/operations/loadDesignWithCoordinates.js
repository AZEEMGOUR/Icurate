import { v4 as uuidv4 } from 'uuid';

const processShapes = (properties, layerMap, userSize, instanceOrigin = [0, 0], translationOffset = [0, 0], makeInvisible = false) => {
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

        // Adjust coordinates based on the instance origin and translation offset
        let coords = shape.coordinates.map(coord => [
            coord[0] / userSize + instanceOrigin[0] + translationOffset[0],  // Adjust with translation
            coord[1] / userSize * -1 + instanceOrigin[1] + translationOffset[1]  // Adjust with translation
        ]);

        const key = `${shape.layer_number}-${shape.datatype_number}`;
        const matchingLayer = layerMap.get(key);

        if (matchingLayer) {
            const color = matchingLayer.color;

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
                const y = coords[0][1];  // Y adjusted relative to instance

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
            console.warn(`Skipping shape: No matching layer found for layer_number ${shape.layer_number} and datatype_number ${shape.datatype_number}`);
        }
    });

    return shapes;
};


const processChildShapes = (properties, layerMap, userSize, instanceOrigin = [0, 0], translationOffset = [0, 0], makeInvisible = false) => {
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
                //console.log("nested label coordinates",shape.properties)
                const x = coords[0][0];  // X adjusted relative to instance
                const y = coords[0][1];  // Y adjusted relative to instance

                const newLabel = {
                    id: shape.id || `child_label_${uuidv4()}`,
                    type: shape.type,
                    text: shape.name,
                    x: x,  // X position relative to the instance origin
                    y: -y,  // Y position relative to the instance origin
                    rotation: shape.rotation || 0,
                    layerId: shape.layer_number,
                    datatypeId: shape.datatype_number,
                    fontSize: 16,                // Default font size
                    fontFamily: 'Arial',
                    color: color,
                    visible: !makeInvisible  // Ensure visibility is always defined
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


const processInstance = (shape, layoutData, layerMap, userSize, instanceOrigin, translationOffset, processedInstances, makeInvisible=false) => {
    const instanceKey = `${shape.name}-${shape.origin[0][0]}-${shape.origin[0][1]}`;

    const instanceOriginX = shape.origin[0][0] / userSize + instanceOrigin[0] + translationOffset[0];  // Apply origin and translation
    const instanceOriginY = shape.origin[0][1] / userSize  + instanceOrigin[1] + translationOffset[1];  // Apply origin and translation

    // Find the corresponding cell for this instance by the name
    const matchingCell = layoutData.layout_data.cells.find(c => c.cell_name === shape.name);

    if (!matchingCell || !Array.isArray(matchingCell.properties)) {
        console.warn("No matching cell or properties found for instance:", shape.name);
        return null;
    }

    // Process shapes within the instance relative to the instance origin
    //const instanceShapes = processShapes(matchingCell.properties, layerMap, userSize, [instanceOriginX, instanceOriginY], translationOffset, true); // Make the shapes invisible

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
        layerId: String(shape.layer_number),
        datatypeId: String(shape.datatype_number),
        nameVisible: true,
        visible: shape.visible !== undefined ? shape.visible : !makeInvisible ,  // Instance bounding box is visible
        children: []  // Instance starts without children
    };

    processedInstances.set(instanceKey, newInstance);
    //processedInstances.set(instanceKey, newInstance);  // Store the processed instance
    const childShapesGroup = processChildShapes(matchingCell.properties, layerMap, userSize, [instanceOriginX, instanceOriginY], true);
    newInstance.children.push(...childShapesGroup);  // Add all child shapes
    // Recursively process nested instances
    matchingCell.properties.forEach((nestedShape) => {
        if (nestedShape.type === "Instance") {
            const nestedInstance = processInstance(nestedShape, layoutData, layerMap, userSize, [instanceOriginX, instanceOriginY], translationOffset, processedInstances);
            if (nestedInstance) {
                newInstance.children.push(nestedInstance);
            }
        }
    });

    return newInstance;
};

const calculateBoundingBox = (cells, userSize) => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    cells.forEach(cell => {
        cell.properties.forEach(shape => {
            if (shape.coordinates && Array.isArray(shape.coordinates) && shape.coordinates.length > 0) {
                shape.coordinates.forEach(coord => {
                    const x = coord[0] / userSize;
                    const y = coord[1] / userSize * -1;

                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                });
            }
        });
    });

    return { minX, minY, maxX, maxY };
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


// Updated loadShapesFromFile to adjust top-level X, Y and handle bounding box translation
const loadDesignWithCoordinates = async (fileData, appendShapes, layers, topLevelX = 0, topLevelY = 0, setTopcellname) => {
    if (!layers || !Array.isArray(layers)) {
        console.error("Layers are undefined or not an array");
        return;
    }

    const { file } = fileData;
    if (file instanceof Blob) {
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
            setTopcellname(firstTopLevelCell)

            // Calculate the bounding box of the entire design
            const boundingBox = calculateBoundingBox(layoutData.layout_data.cells, userSize);

            // Determine the translation offset to move the design to the specified origin
            const translationOffset = [
                topLevelX - boundingBox.minX,  // Translate to the provided X origin
                topLevelY - boundingBox.minY   // Translate to the provided Y origin
            ];

            const layerMap = new Map();
            layers.forEach(layer => {
                const key = `${layer.layer_number}-${layer.datatype_number}`;
                layerMap.set(key, layer);
            });

            const newShapes = [];  // Create a new array for the loaded shapes
            const processedInstances = new Map();

            // Process top-level cells
            const instanceNames = new Set();
            layoutData.layout_data.cells.forEach(cell => {
                cell.properties.forEach(prop => {
                    if (prop.type === "Instance") {
                        instanceNames.add(prop.name);
                    }
                });
            });

            const topLevelCells = layoutData.layout_data.cells.filter(cell => !instanceNames.has(cell.cell_name));

            // Process the top-level cells
            topLevelCells.forEach((cell) => {
                const cellShapes = processShapes(cell.properties, layerMap, userSize, [topLevelX, topLevelY], translationOffset);
                newShapes.push(...cellShapes);

                // Process instances within top-level cells
                cell.properties.forEach((shape) => {
                    if (shape.type === "Instance") {
                        const newInstance = processInstance(shape, layoutData, layerMap, userSize, [topLevelX, topLevelY], translationOffset, processedInstances);
                        if (newInstance) {
                            newShapes.push(newInstance);  // Add top-level instances
                        }
                    }
                });
            });

            console.log("New shapes loaded:", newShapes);

            // Append new shapes to the existing ones
            appendShapes((prevShapes) => [...prevShapes, ...newShapes]);
        };

        reader.readAsText(file);
    } else {
        console.error("Invalid file type or file input.");
    }
};

export default loadDesignWithCoordinates;
