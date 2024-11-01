const flipY = (selectedShapes, setShapes) => {
    const duration = 300; // Duration of the animation in ms
    const startTime = performance.now();

    const animate = () => {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Progress from 0 to 1

        setShapes(prevShapes =>
            prevShapes.map(shape => {
                if (selectedShapes.some(selectedShape => selectedShape.id === shape.id)) {
                    const newScaleY = shape.scaleY > 0
                        ? Math.cos(progress * Math.PI)  // Simulate 3D flip by using cosine function
                        : -Math.cos(progress * Math.PI);

                    const newY = shape.y + shape.height * (shape.scaleY - newScaleY) / 2;
                    return {
                        ...shape,
                        scaleY: newScaleY,
                        y: newY, // Adjust y to flip around the center
                    };
                }
                return shape;
            })
        );

        if (progress < 1) {
            requestAnimationFrame(animate); // Continue the animation
        }
    };

    requestAnimationFrame(animate);
};

export default flipY;
