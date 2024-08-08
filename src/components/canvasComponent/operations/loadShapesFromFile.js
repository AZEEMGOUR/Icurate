const loadShapesFromFile = (event, setShapes, layerVisibility = {}) => {
    const input = event.target;
    if (input.files && input.files.length) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const fileContent = reader.result;
            const layoutData = JSON.parse(fileContent);

            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;

            const shapes = layoutData.layout_data.cells[0].properties.map((shape, index) => {
                const coords = shape.coordinates;

                // Since the origin is already considered in the saved coordinates, load them directly
                const x = coords[0][0];
                const y = coords[0][1];
                const width = coords[1][0] - coords[0][0];
                const height = coords[2][1] - coords[0][1];

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
                    visible: true,
                };
            });

            console.log('Loaded shapes:', shapes); // Debugging
            setShapes(shapes);
        };
        reader.readAsText(file);
    }
};



export default loadShapesFromFile;
