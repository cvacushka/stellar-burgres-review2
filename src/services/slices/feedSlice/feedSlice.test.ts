import { PayloadAction } from '@reduxjs/toolkit';
import feedSlice, { getFeeds, initialState } from './feedSlice';

interface FeedResponse {
  orders: string[];
}

describe('Feed Management System', () => {
  const createMockAction = <T>(actionType: string, data?: T) => ({
    type: actionType,
    payload: data
  });

  describe('Real-time Feed Updates', () => {
    const mockOrders = ['order-xyz-789', 'order-abc-123'];
    
    const mockActions = {
      fetchStarted: createMockAction(getFeeds.pending.type),
      fetchFailed: {
        type: getFeeds.rejected.type,
        error: { message: 'Network connectivity issue' }
      },
      fetchSucceeded: createMockAction<FeedResponse>(getFeeds.fulfilled.type, {
        orders: mockOrders
      })
    };

    it('transitions to loading state when fetch begins', () => {
      const nextState = feedSlice(initialState, mockActions.fetchStarted);
      
      expect(nextState).toEqual({
        ...initialState,
        loading: true,
        error: null
      });
    });

    it('handles feed fetch failures appropriately', () => {
      const nextState = feedSlice(initialState, mockActions.fetchFailed);
      
      expect(nextState).toEqual({
        ...initialState,
        loading: false,
        error: mockActions.fetchFailed.error.message
      });
    });

    it('successfully updates feed with new orders', () => {
      const nextState = feedSlice(initialState, mockActions.fetchSucceeded);
      
      expect(nextState).toEqual({
        loading: false,
        error: null,
        orders: mockOrders
      });
    });

    it('maintains data integrity through state transitions', () => {
      // Simulate complete feed fetch lifecycle
      const loadingState = feedSlice(initialState, mockActions.fetchStarted);
      const completedState = feedSlice(loadingState, mockActions.fetchSucceeded);
      
      expect(completedState.loading).toBeFalsy();
      expect(completedState.error).toBeNull();
      expect(completedState.orders).toHaveLength(mockOrders.length);
      expect(completedState.orders).toEqual(expect.arrayContaining(mockOrders));
    });
  });
});
