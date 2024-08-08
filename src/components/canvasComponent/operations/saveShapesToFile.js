// src/components/canvasComponent/operations/saveShapesToFile.js

const convertShapesToLayoutData = (shapes, projectName) => {
    return {
        layout_data: {
            units: {
                user_size: 0.001,
                db_size: 5e-09
            },
            cells: [
                {
                    cell_name: "cell_name",
                    cell_id: "cell_name",
                    properties: shapes.map(shape => ({
                        id: "",
                        type: shape.type,
                        layer_number: shape.layerId,
                        datatype_number: 0,
                        coordinates: [
                            [shape.x, -shape.y + shape.height],
                            [shape.x + shape.width, -shape.y + shape.height],
                            [shape.x + shape.width, -shape.y],
                            [shape.x, -shape.y]
                            
                        ]
                    }))
                }
            ]
        }
    };
};


const saveShapesToFile = (shapes, projectName) => {
    const layoutData = convertShapesToLayoutData(shapes, projectName);
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${projectName}_layout_data.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

export default saveShapesToFile;