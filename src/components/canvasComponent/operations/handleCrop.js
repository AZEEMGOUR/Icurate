import Konva from 'konva';
import polygonClipping from 'polygon-clipping';

const groupShapes = (stageRef, shapes, setShapes, setSelectedShapes) => {
    const stage = stageRef.current;
    const layer = stage.findOne('Layer');
    let tempGroupRect = null;
    let isGrouping = false;
    let groupedShapesData = [];

    const startGroup = (e) => {
        if (!isGrouping) {
            const pos = stage.getPointerPosition();
            tempGroupRect = new Konva.Rect({
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                stroke: 'blue',
                dash: [4, 2],
                name: 'tempGroupRect',
                listening: false,
            });
            layer.add(tempGroupRect);
            isGrouping = true;
            stage.on('mousemove', updateGroup);
            stage.on('mouseup', endGroup);
        }
    };

    const updateGroup = (e) => {
        if (isGrouping && tempGroupRect) {
            const pos = stage.getPointerPosition();
            tempGroupRect.width(pos.x - tempGroupRect.x());
            tempGroupRect.height(pos.y - tempGroupRect.y());
            layer.batchDraw();
        }
    };

    const endGroup = (e) => {
        if (isGrouping && tempGroupRect) {
            const groupRect = tempGroupRect.getClientRect();
            const groupedShapes = shapes.filter(shape => shape.visible && haveIntersection(shape, groupRect));

            console.log('Group Rectangle:', groupRect); // Debugging log
            console.log('Shapes within Group Rectangle:', groupedShapes); // Debugging log

            if (groupedShapes.length > 0) {
                const newGroupRect = {
                    id: `group-${Date.now()}`,
                    x: groupRect.x,
                    y: groupRect.y,
                    width: groupRect.width,
                    height: groupRect.height,
                    color: 'rgba(0,0,255,0.2)',
                    boundaryColor: 'blue',
                    layerId: null,
                    visible: true,
                    type: 'Rect',
                    groupedShapeIds: groupedShapes.map(shape => shape.id),
                };

                groupedShapesData = [newGroupRect, ...groupedShapes];
                setShapes(prevShapes => [...prevShapes, newGroupRect]);
                setSelectedShapes([]);
                console.log('New Group Rect:', newGroupRect); // Debugging log
                console.log('Grouped Shapes Data:', groupedShapesData); // Debugging log

                tempGroupRect.destroy();
                tempGroupRect = null;
                isGrouping = false;
                stage.off('mousemove', updateGroup);
                stage.off('mouseup', endGroup);

                // Trigger the popup with the new group rectangle data
                return groupedShapesData;
            } else {
                tempGroupRect.destroy();
                tempGroupRect = null;
                isGrouping = false;
                stage.off('mousemove', updateGroup);
                stage.off('mouseup', endGroup);
                return [];
            }
        }
    };

    const haveIntersection = (shape, rect) => {
        const shapePolygon = [
            [shape.x, shape.y],
            [shape.x + shape.width, shape.y],
            [shape.x + shape.width, shape.y + shape.height],
            [shape.x, shape.y + shape.height],
            [shape.x, shape.y]
        ];

        const rectPolygon = [
            [rect.x, rect.y],
            [rect.x + rect.width, rect.y],
            [rect.x + rect.width, rect.y + rect.height],
            [rect.x, rect.y + rect.height],
            [rect.x, rect.y]
        ];

        const intersection = polygonClipping.intersection([shapePolygon], [rectPolygon]);

        return intersection.length > 0;
    };

    stage.on('mousedown', startGroup);

    const handleEscape = (e) => {
        if (e.key === 'Escape' && isGrouping) {
            if (tempGroupRect) {
                tempGroupRect.destroy();
                tempGroupRect = null;
            }
            isGrouping = false;
            stage.off('mousemove', updateGroup);
            stage.off('mouseup', endGroup);
            layer.batchDraw();
        }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
        stage.off('mousedown', startGroup);
        window.removeEventListener('keydown', handleEscape);
    };

    return groupedShapesData; // Ensure we return the grouped shapes data here
};

export default groupShapes;
