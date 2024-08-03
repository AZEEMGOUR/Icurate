import Konva from 'konva';

const groupShapes = (stageRef, shapes, setShapes, selectedShapes, setSelectedShapes) => {
    const stage = stageRef.current;
    const layer = stage.findOne('Layer');

    if (selectedShapes.length > 0) {
        const group = new Konva.Group({
            draggable: true,
        });

        selectedShapes.forEach(shape => {
            const konvaShape = layer.findOne(`#${shape.id}`);
            if (konvaShape) {
                group.add(konvaShape.clone());
                konvaShape.destroy();
            }
        });

        layer.add(group);
        layer.batchDraw();

        const newShapes = shapes.filter(shape => !selectedShapes.includes(shape));
        newShapes.push({
            id: `group-${Date.now()}`,
            type: 'Group',
            shapes: selectedShapes.map(shape => ({ ...shape })),
        });

        setShapes(newShapes);
        setSelectedShapes([]);
    }
};

export default groupShapes;
