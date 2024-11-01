let redoStack = [];

const redo = (shapes, setShapes) => {
    if (redoStack.length > 0) {
        const nextState = redoStack.pop();  // Get the last redo state
        setShapes(nextState);  // Set the shapes to the redo state
    }
};

const saveState = (shapes) => {
    redoStack.push([...shapes]);  // Save the current state to the redo stack
};

export { redo, saveState };
