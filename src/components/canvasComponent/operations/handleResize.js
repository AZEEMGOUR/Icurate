import Konva from 'konva';

const handleResize = (stageRef, shape, setShapes, setResizingShape) => {
    const stage = stageRef.current;
    const layer = stage.findOne('Layer');
    let resizeAnchor = null;
    let initialShapeAttrs = null;

    const startResize = (e) => {
        if (shape) {
            const pos = stage.getPointerPosition();
            initialShapeAttrs = { ...shape.attrs };
            resizeAnchor = new Konva.Rect({
                x: pos.x,
                y: pos.y,
                width: 10,
                height: 10,
                fill: 'blue',
                draggable: true,
                dragBoundFunc: (pos) => {
                    return {
                        x: pos.x,
                        y: pos.y,
                    };
                },
            });
            layer.add(resizeAnchor);
            stage.on('mousemove', updateResize);
            stage.on('mouseup', endResize);
        }
    };

    const updateResize = (e) => {
        if (resizeAnchor) {
            const pos = stage.getPointerPosition();
            const newWidth = pos.x - initialShapeAttrs.x;
            const newHeight = pos.y - initialShapeAttrs.y;
            shape.width(newWidth);
            shape.height(newHeight);
            layer.batchDraw();
        }
    };

    const endResize = (e) => {
        if (resizeAnchor) {
            resizeAnchor.destroy();
            resizeAnchor = null;
            setShapes(prevShapes => prevShapes.map(s => s.id === shape.id ? shape.attrs : s));
            stage.off('mousemove', updateResize);
            stage.off('mouseup', endResize);
            setResizingShape(false);
        }
    };

    stage.on('mousedown', startResize);

    const handleEscape = (e) => {
        if (e.key === 'r' && resizeAnchor) {
            resizeAnchor.destroy();
            resizeAnchor = null;
            shape.attrs = { ...initialShapeAttrs };
            stage.off('mousemove', updateResize);
            stage.off('mouseup', endResize);
            setResizingShape(false);
            layer.batchDraw();
        }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
        stage.off('mousedown', startResize);
        window.removeEventListener('keydown', handleEscape);
    };
};

export default handleResize;
