let history = [];  // To store previous states for undo
let redoStack = [];  // To store redo states

// Save the current state before changes (deep clone to avoid reference issues)
export const saveState = (currentState) => {
  history.push(JSON.parse(JSON.stringify(currentState)));
  redoStack = [];  // Clear redo stack after a new action is performed
};

// Undo function
export const undo = (currentShapes, setShapes) => {
  if (history.length === 0) return; // Nothing to undo

  // Save current state in redoStack
  redoStack.push(JSON.parse(JSON.stringify(currentShapes)));

  // Restore previous state from history
  const previousState = history.pop();
  setShapes(previousState); // Update the shapes with the previous state
};

// Redo function
export const redo = (currentShapes, setShapes) => {
  if (redoStack.length === 0) return; // Nothing to redo

  // Save current state in history
  history.push(JSON.parse(JSON.stringify(currentShapes)));

  // Restore the next state from redoStack
  const nextState = redoStack.pop();
  setShapes(nextState); // Update the shapes with the redone state
};
