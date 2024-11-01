const USER_SIZE = 0.0005;

const convertShapeToProperty = (shape) => {
    const baseShape = {
        layer_number: parseInt(shape.layerId, 10) || 0,
        datatype_number: parseInt(shape.datatypeId, 10) || 0,
    };

    const adjustedX = shape.x * USER_SIZE;
    const adjustedY = -shape.y * USER_SIZE;  // Adjusted without negation here
    const adjustedWidth = shape.width * USER_SIZE;
    const adjustedHeight = shape.height * USER_SIZE;

    if (shape.type === 'Polygon' || shape.type === 'Rectangle') {
        return {
            type: shape.type,
            layer_number: baseShape.layer_number,
            datatype_number: baseShape.datatype_number,
            coordinates: [
                [adjustedX, (adjustedY)],
                [adjustedX + adjustedWidth, (adjustedY)],
                [adjustedX + adjustedWidth, (adjustedY + adjustedHeight)],
                [adjustedX, (adjustedY + adjustedHeight)]
            ]
        };
    } else if (shape.type === 'Text') {
        return {
            type: shape.type,
            layer_number: baseShape.layer_number,
            datatype_number: baseShape.datatype_number,
            coordinates: [[adjustedX, adjustedY]],
            text: shape.text,
            rotation: shape.rotation || 0
        };
    } else if (shape.type === 'Label') {
        return {
            type: "Label",
            layer_number: baseShape.layer_number,
            datatype_number: baseShape.datatype_number,
            coordinates: [[adjustedX, adjustedY]],
            name: shape.text,
            rotation: shape.rotation || 0
        };
    }

    return null;
};

const calculateBoundingBox = (properties) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    properties.forEach(property => {
        property.coordinates.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        });
    });

    return { minX, minY, maxX, maxY };
};

const convertInstanceToLayout = (instance, layoutData) => {
    const childrenProperties = [];
    const nestedInstances = [];

    instance.children.forEach(childShape => {
        if (childShape.type === 'Instance') {
            nestedInstances.push(childShape);
        } else {
            childrenProperties.push(convertShapeToProperty(childShape));
        }
    });

    const boundingBox = calculateBoundingBox(childrenProperties);

    const instanceMetadata = {
        type: "Instance",
        origin: [
            [instance.x * USER_SIZE, -instance.y * USER_SIZE]  // Adjusted without negation here
        ],
        bounding_box: [
            [boundingBox.minX, -boundingBox.minY],
            [boundingBox.maxX, -boundingBox.maxY]
        ],
        name: instance.name || `Instance_${instance.id}`,
        rotation: instance.rotation || 0,
        mirror_x: instance.mirrorX || false
    };

    // Add the instance's own properties first
    const instanceCell = {
        cell_name: instance.name || `Instance_${instance.id}`,
        properties: [...childrenProperties]
    };

    // Add nested instances after the parent's properties
    nestedInstances.forEach(nestedInstance => {
        const nestedInstanceMetadata = convertInstanceToLayout(nestedInstance, layoutData);
        instanceCell.properties.push(nestedInstanceMetadata);
    });

    // Push the instanceCell to the layout data
    layoutData.layout_data.cells.push(instanceCell);

    return instanceMetadata;
};

export const convertShapesToLayoutData = (shapes, projectName) => {
    const layoutData = {
        layout_data: {
            units: {
                user_size: USER_SIZE,
                db_size: 5e-10
            },
            cells: []
        }
    };

    const projectShapes = [];
    const instances = [];

    shapes.forEach(shape => {
        if (shape.type === 'Instance') {
            if (shape.children && shape.children.length > 0) {
                instances.push(shape);
            } else {
                console.warn(`No valid children shapes found for instance: ${shape.id}`);
            }
        } else {
            projectShapes.push(shape);
        }
    });

    if (projectShapes.length > 0) {
        const projectProperties = projectShapes.map(shape => convertShapeToProperty(shape));
        layoutData.layout_data.cells.push({
            cell_name: projectName,
            properties: projectProperties 
        });
    }

    instances.forEach(instance => {
        const instanceMetadata = convertInstanceToLayout(instance, layoutData);

        // Add the instance to the top-level project cell
        const projectCell = layoutData.layout_data.cells.find(cell => cell.cell_name === projectName);
        if (projectCell) {
            projectCell.properties.push(instanceMetadata);
        }
    });

    console.log(layoutData);
    return layoutData;
};