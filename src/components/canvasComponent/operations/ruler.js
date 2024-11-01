// rulerOperations.js

import { v4 as uuidv4 } from 'uuid';

export const startRuler = (e, setStartPoint, setEndPoint, setIsDrawing, stage) => {
    const pointerPosition = stage.getRelativePointerPosition();
    const adjustedX = pointerPosition.x - stage.width() / 2;
    const adjustedY = pointerPosition.y - stage.height() / 2;

    setStartPoint({ x: adjustedX, y: adjustedY });
    setEndPoint(null);
    setIsDrawing(true);
};

export const moveRuler = (e, startPoint, setEndPoint, stage, setDistance, scaleType, unit) => {
    const pointerPosition = stage.getRelativePointerPosition();
    const adjustedX = pointerPosition.x - stage.width() / 2;
    const adjustedY = pointerPosition.y - stage.height() / 2;

    if (startPoint) {
        setEndPoint({ x: adjustedX, y: adjustedY });
        const dist = calculateDistance(startPoint, { x: adjustedX, y: adjustedY }, scaleType, unit);
        setDistance(dist);
    }
};

export const endRuler = (startPoint, endPoint, setShapes, setIsDrawing, scaleType, unit, selectedLayer) => {
    if (startPoint && endPoint) {
        const distance = calculateDistance(startPoint, endPoint, scaleType, unit);
        const newLine = {
            id: uuidv4(),
            start: startPoint,
            end: endPoint,
            distance: `${distance} ${unit}`,
            unit: unit,
            color: selectedLayer?.color || 'red',
        };
        setShapes(prevShapes => [...prevShapes, newLine]);
        setIsDrawing(false);
    }
};

export const calculateDistance = (start, end, scaleType, unit) => {
    if (!start || !end) return '';

    let dx = end.x - start.x;
    let dy = end.y - start.y;

    if (scaleType === 'horizontal') dy = 0;
    if (scaleType === 'vertical') dx = 0;
    if (scaleType === 'diagonal') {
        const diagDist = Math.min(Math.abs(dx), Math.abs(dy));
        dx = diagDist * Math.sign(dx);
        dy = diagDist * Math.sign(dy);
    }

    const distInPixels = Math.sqrt(dx * dx + dy * dy);

    switch (unit) {
        case 'cm':
            return (distInPixels / 37.7952755906).toFixed(2); // 1 cm = 37.79 px at 96 DPI
        case 'inch':
            return (distInPixels / 96).toFixed(2); // 1 inch = 96 px at 96 DPI
        default:
            return distInPixels.toFixed(2);
    }
};
