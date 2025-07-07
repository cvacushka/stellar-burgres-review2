import { PayloadAction } from '@reduxjs/toolkit';
import ingredientSlice, {
  getIngredients,
  initialState
} from './ingredientSlice';

interface IngredientState {
  loading: boolean;
  error: string | null;
  ingredients: any[];
}

describe('Ingredient Catalog Management', () => {
  const mockIngredients = [
    { id: 'ing-1', name: 'Quantum Patty', type: 'main' },
    { id: 'ing-2', name: 'Stellar Cheese', type: 'main' }
  ];

  const createActionWithType = <T>(actionCreator: any, payload?: T) => ({
    type: actionCreator.type,
    payload
  });

  describe('Ingredient Data Fetching', () => {
    it('handles catalog loading states correctly', () => {
      // Test loading state
      const loadingState = ingredientSlice(
        initialState,
        createActionWithType(getIngredients.pending)
      );
      
      expect(loadingState).toEqual<IngredientState>({
        ...initialState,
        loading: true,
        error: null
      });

      // Test error state
      const errorState = ingredientSlice(
        loadingState,
        {
          type: getIngredients.rejected.type,
          error: { message: 'API connection failed' }
        }
      );
      
      expect(errorState).toEqual<IngredientState>({
        ...initialState,
        loading: false,
        error: 'API connection failed'
      });

      // Test success state
      const successState = ingredientSlice(
        loadingState,
        createActionWithType(getIngredients.fulfilled, mockIngredients)
      );
      
      expect(successState).toEqual<IngredientState>({
        loading: false,
        error: null,
        ingredients: mockIngredients
      });
    });

    it('preserves data integrity during state transitions', () => {
      const transitions = {
        initial: initialState,
        loading: ingredientSlice(
          initialState,
          createActionWithType(getIngredients.pending)
        ),
        success: ingredientSlice(
          { ...initialState, loading: true },
          createActionWithType(getIngredients.fulfilled, mockIngredients)
        )
      };

      // Verify state transitions maintain data consistency
      expect(transitions.loading.ingredients).toEqual(initialState.ingredients);
      expect(transitions.success.ingredients).toHaveLength(mockIngredients.length);
      expect(transitions.success.loading).toBeFalsy();
      expect(transitions.success.error).toBeNull();
    });
  });
});
