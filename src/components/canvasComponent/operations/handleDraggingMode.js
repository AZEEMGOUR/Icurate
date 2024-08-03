import Konva from 'konva';

export const activateDraggingMode = (selectedShapes, layerRef, stageRef, setIsDraggingMode, groupRef) => {
    if (selectedShapes.length > 0 && !groupRef.current) {
        // Create a new group
        const group = new Konva.Group({
            draggable: true,
        });

        // Add selected shapes to the group
        selectedShapes.forEach((shape) => {
            const node = layerRef.current.findOne(`#${shape.id}`);
            if (node) {
                group.add(node);
            }
        });

        // Add the group to the layer
        layerRef.current.add(group);
        groupRef.current = group;

        // Make the group draggable
        group.draggable(true);
        layerRef.current.draw();

        setIsDraggingMode(true);
    }
};

export const deactivateDraggingMode = (layerRef, setIsDraggingMode, groupRef, transformerRef) => {
    if (groupRef.current) {
        // Destroy the group and return its children to the layer
        groupRef.current.destroyChildren(); // Remove shapes from the group
        groupRef.current.destroy(); // Remove the group itself
        groupRef.current = null;

        // Clear transformer selection
        transformerRef.current.nodes([]);

        // Redraw the layer
        layerRef.current.draw();

        setIsDraggingMode(false);
    }
};

const addEscapeListener = (deactivateFunction, key) => {
    const handleKeyDown = (event) => {
        if (event.key === key) {
            deactivateFunction();
            window.removeEventListener('keydown', handleKeyDown);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
};
