export const updateVisibilityBasedOnHierarchy = (shapes, currentLevel, targetLevel) => {
    const updateShapeVisibility = (shape, currentLevel, targetLevel, level) => {
        if (typeof shape !== 'object' || shape === null) {
            return;
        }

        // Determine if the current shape's level is within the specified level range
        const isWithinLevelRange = level >= currentLevel && level <= targetLevel;

        // Update the visibility of the shape based on the level range
        shape.visible = isWithinLevelRange;

        // Recursively handle nested shapes or instances, increasing the level for children
        if (shape.children && Array.isArray(shape.children)) {
            shape.children.forEach(child => {
                updateShapeVisibility(child, currentLevel, targetLevel, level + 1);
            });
        }
    };

    // Iterate through all top-level shapes and update their visibility
    shapes.forEach(shape => {
        updateShapeVisibility(shape, currentLevel, targetLevel, 0);  // Start with the root level (0)
    });

    return shapes;
};
