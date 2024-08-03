const loadShapesFromFile = (event, setShapes, layerVisibility = {}) => {
    const input = event.target;
    if (input.files && input.files.length) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const fileContent = reader.result;
            const layoutData = JSON.parse(fileContent);

            const shapes = layoutData.layout_data.cells[0].properties.map((shape, index) => {
                const coords = shape.coordinates;

                // Calculate x, y, width, height from coordinates
                const x = coords[0][0];
                const y = coords[2][1];
                const width = coords[1][0] - coords[0][0];
                const height = coords[0][1] - coords[2][1];

                // Check the visibility of the layer and set the shape's visibility accordingly
                const isVisible = layerVisibility.hasOwnProperty(shape.layer_number)
                    ? layerVisibility[shape.layer_number]
                    : true; // Default to true if the layer number is not in layerVisibility

                return {
                    id: shape.id || `shape_${index}_${Date.now()}`, 
                    type: 'Rect',
                    layerId: shape.layer_number,
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    fill: 'gray',
                    opacity: 1,
                    stroke: 'black',
                    strokeWidth: 1,
                    visible: isVisible,
                };
            });

            setShapes(shapes);
        };
        reader.readAsText(file);
    }
};

export default loadShapesFromFile;