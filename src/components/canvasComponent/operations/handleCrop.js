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
            const pos = stage.getRelativePointerPosition();
            const adjustedX = pos.x - stage.width() / 2;
            const adjustedY = pos.y - stage.height() / 2;
            tempGroupRect = new Konva.Rect({
                x: adjustedX,
                y: adjustedY,
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
            const pos = stage.getRelativePointerPosition();
            const adjustedX = pos.x - stage.width() / 2;
            const adjustedY = pos.y - stage.height() / 2;
            tempGroupRect.width(adjustedX - tempGroupRect.x());
            tempGroupRect.height(adjustedY - tempGroupRect.y());
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
        let shapePolygon = [];
    
        // For Rectangle
        if (shape.type === 'Rectangle') {
            shapePolygon = [
                [shape.x, shape.y],
                [shape.x + shape.width, shape.y],
                [shape.x + shape.width, shape.y + shape.height],
                [shape.x, shape.y + shape.height],
                [shape.x, shape.y]
            ];
        }
        // For Polygon
        else if (shape.type === 'Polygon' && shape.points && Array.isArray(shape.points)) {
            shapePolygon = [];
            for (let i = 0; i < shape.points.length; i += 2) {
                shapePolygon.push([shape.points[i], shape.points[i + 1]]);
            }
            // Close the polygon if it's not already closed
            if (shapePolygon.length > 0 && 
                (shapePolygon[0][0] !== shapePolygon[shapePolygon.length - 1][0] || 
                 shapePolygon[0][1] !== shapePolygon[shapePolygon.length - 1][1])) {
                shapePolygon.push([...shapePolygon[0]]); // Add the first point to close the loop
            }
        }
    
        const rectPolygon = [
            [rect.x, rect.y],
            [rect.x + rect.width, rect.y],
            [rect.x + rect.width, rect.y + rect.height],
            [rect.x, rect.y + rect.height],
            [rect.x, rect.y]
        ];
    
        // Check if polygons are valid
        if (shapePolygon.length === 0 || rectPolygon.length === 0) {
            console.error("Empty or invalid polygon detected", { shapePolygon, rectPolygon });
            return false;  // No intersection if either polygon is invalid
        }
    
        // Perform the intersection check
        const intersection = polygonClipping.intersection([shapePolygon], [rectPolygon]);
        return intersection && intersection.length > 0;
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
