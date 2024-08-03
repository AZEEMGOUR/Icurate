export const selectShape = (x, y, shapes, setSelectedShapes) => {
    // Find all shapes under the click
    const clickedShapes = shapes.filter(shape =>
        x > shape.x && x < shape.x + shape.width &&
        y > shape.y && y < shape.y + shape.height
    );

    if (clickedShapes.length > 0) {
        // Select the shape with the highest z-index
        const topShape = clickedShapes.reduce((highest, current) =>
            highest.zIndex > current.zIndex ? highest : current
        );
        setSelectedShapes([topShape]);
    } else {
        setSelectedShapes([]);
    }
};
