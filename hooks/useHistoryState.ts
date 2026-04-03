import { useState, useCallback } from 'react';

const HISTORY_LIMIT = 50;

export const useHistoryState = <T>(initialState: T) => {
  const [state, setState] = useState<{
    past: T[];
    present: T;
    future: T[];
  }>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newState: T | ((prevState: T) => T)) => {
    setState(currentState => {
      const newPresent = newState instanceof Function ? newState(currentState.present) : newState;
      
      // Don't add to history if state is the same
      if (JSON.stringify(newPresent) === JSON.stringify(currentState.present)) {
        return currentState;
      }
      
      const newPast = [...currentState.past, currentState.present];
      // Limit history size
      if (newPast.length > HISTORY_LIMIT) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newPresent,
        future: [], // Clear future on new state
      };
    });
  }, []);
  
  const undo = useCallback(() => {
    if (!canUndo) return;
    setState(currentState => {
      const { past, present, future } = currentState;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    });
  }, [canUndo]);
  
  const redo = useCallback(() => {
    if (!canRedo) return;
    setState(currentState => {
      const { past, present, future } = currentState;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    });
  }, [canRedo]);
  
  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
