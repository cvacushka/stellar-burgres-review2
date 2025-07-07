import { PayloadAction } from '@reduxjs/toolkit';
import orderSlice, { initialState, getOrderByNumber } from './orderSlice';
import { TOrder } from '@utils-types';

interface OrderState {
  orders: TOrder[];
  orderByNumberResponse: TOrder | null;
  request: boolean;
  responseOrder: null;
  error: string | null;
}

describe('Order Details Management', () => {
  const mockOrderData: TOrder = {
    _id: 'order-123',
    name: 'Test Order',
    status: 'completed',
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
    number: 12345,
    ingredients: ['ingredient-1', 'ingredient-2']
  };

  describe('Order Lookup Operations', () => {
    const simulateOrderLookup = (
      currentState: OrderState,
      action: { type: string; payload?: any; error?: { message: string } }
    ) => orderSlice(currentState, action as PayloadAction<any>);

    it('manages order lookup lifecycle', () => {
      // Initiate lookup
      const searchingState = simulateOrderLookup(initialState, {
        type: getOrderByNumber.pending.type,
        payload: undefined
      });

      expect(searchingState).toEqual({
        ...initialState,
        request: true,
        error: null
      });

      // Handle lookup failure
      const failedState = simulateOrderLookup(searchingState, {
        type: getOrderByNumber.rejected.type,
        payload: undefined,
        error: { message: 'Order not found in database' }
      });

      expect(failedState).toEqual({
        ...initialState,
        request: false,
        error: 'Order not found in database'
      });

      // Handle successful lookup
      const successState = simulateOrderLookup(searchingState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [mockOrderData] }
      });

      expect(successState).toEqual({
        ...initialState,
        request: false,
        error: null,
        orderByNumberResponse: mockOrderData
      });
    });

    it('maintains data consistency through state transitions', () => {
      // Setup initial search
      const searching = simulateOrderLookup(initialState, {
        type: getOrderByNumber.pending.type,
        payload: undefined
      });

      // Verify state transitions
      expect(searching.orderByNumberResponse).toEqual(initialState.orderByNumberResponse);
      expect(searching.request).toBeTruthy();
      expect(searching.error).toBeNull();

      // Complete search successfully
      const completed = simulateOrderLookup(searching, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [mockOrderData] }
      });

      // Verify final state
      expect(completed.request).toBeFalsy();
      expect(completed.error).toBeNull();
      expect(completed.orderByNumberResponse).toBeDefined();
      expect(completed.orderByNumberResponse).toEqual(mockOrderData);
    });
  });
});
