import { configureStore } from '@reduxjs/toolkit';
import store, { rootReducer } from '../services/store';

describe('Redux Store Configuration', () => {
  it('should initialize with correct default state', () => {
    const initialState = store.getState();
    const stateAfterUnknownAction = rootReducer(undefined, { type: 'RANDOM_UNREGISTERED_ACTION' });
    
    expect(initialState).toBeDefined();
    expect(stateAfterUnknownAction).toMatchObject(initialState);
  });

  it('should maintain state consistency after dispatch', () => {
    const mockStore = configureStore({
      reducer: rootReducer
    });
    
    const beforeState = mockStore.getState();
    mockStore.dispatch({ type: 'TEST_ACTION' });
    const afterState = mockStore.getState();
    
    expect(beforeState).toEqual(afterState);
  });

  it('should have all required reducer slices', () => {
    const currentState = store.getState();
    
    // Verify store structure
    expect(currentState).toBeInstanceOf(Object);
    expect(Object.keys(currentState).length).toBeGreaterThan(0);
  });
});
