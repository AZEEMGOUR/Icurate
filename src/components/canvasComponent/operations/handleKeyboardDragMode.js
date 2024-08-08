// handleKeyboardDragMode.js

export const handleKeyboardDragMode = (e, isDraggingMode, setIsDraggingMode, stageRef) => {
    const stage = stageRef.current;

    if (isDraggingMode) {
        // Arrow key movement
        const position = stage.position();
        switch (e.key) {
            case 'ArrowUp':
                stage.position({ x: position.x, y: position.y - 50 });
                break;
            case 'ArrowDown':
                stage.position({ x: position.x, y: position.y + 50 });
                break;
            case 'ArrowLeft':
                stage.position({ x: position.x - 50, y: position.y });
                break;
            case 'ArrowRight':
                stage.position({ x: position.x + 50, y: position.y });
                break;
            case 'Escape':
                setIsDraggingMode(false);  // Exit drag mode
                break;
            default:
                break;
        }
        stage.batchDraw();  // Redraw the stage with the new position
    } else if (e.key === 'g') {
        setIsDraggingMode(true);  // Activate drag mode
    }
};
