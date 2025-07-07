import { PayloadAction } from '@reduxjs/toolkit';
import constructorSlice, {
  addIngredient,
  initialState,
  moveIngredientDown,
  moveIngredientUp,
  orderBurger,
  removeIngredient
} from './constructorSlice';
import { expect, test, describe } from '@jest/globals';

interface BurgerIngredient {
  _id: string;
  name: string;
  type: 'bun' | 'sauce' | 'main';
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_mobile: string;
  image_large: string;
  id?: string;
}

describe('Burger Constructor State Management', () => {
  const mockBun: BurgerIngredient = {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Stellar Bun XL-1000',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
  };

  const mockIngredient: BurgerIngredient = {
    _id: '643d69a5c3f7b9001cfa0943',
    name: 'Quantum Sauce Plus',
    type: 'sauce',
    proteins: 50,
    fat: 22,
    carbohydrates: 11,
    calories: 14,
    price: 80,
    image: 'https://code.s3.yandex.net/react/code/sauce-04.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-04-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-04-large.png'
  };

  describe('Ingredient Management', () => {
    describe('Adding Ingredients', () => {
      it('adds non-bun ingredients to the stack', () => {
        const result = constructorSlice(initialState, addIngredient(mockIngredient));
        
        expect(result.constructorItems.ingredients[0]).toEqual({
          ...mockIngredient,
          id: expect.any(String)
        });
      });

      it('sets bun as the container', () => {
        const result = constructorSlice(initialState, addIngredient(mockBun));
        
        expect(result.constructorItems.bun).toEqual({
          ...mockBun,
          id: expect.any(String)
        });
      });

      it('replaces existing bun with new one', () => {
        const alternativeBun = {
          ...mockBun,
          _id: '643d69a5c3f7b9001cfa093d',
          name: 'Quantum Bun Y-2000',
          price: 988
        };

        const stateWithBun = {
          ...initialState,
          constructorItems: {
            ...initialState.constructorItems,
            bun: { ...mockBun, id: 'existing-bun-id' }
          }
        };

        const result = constructorSlice(stateWithBun, addIngredient(alternativeBun));
        
        expect(result.constructorItems.bun).toEqual({
          ...alternativeBun,
          id: expect.any(String)
        });
      });
    });

    describe('Removing Ingredients', () => {
      it('removes specified ingredient from the stack', () => {
        const stateWithIngredient = {
          ...initialState,
          constructorItems: {
            ...initialState.constructorItems,
            ingredients: [{ ...mockIngredient, id: 'test-id-1' }]
          }
        };

        const result = constructorSlice(stateWithIngredient, removeIngredient('test-id-1'));
        
        expect(result.constructorItems.ingredients).toHaveLength(0);
      });
    });

    describe('Reordering Ingredients', () => {
      const mockStack = [
        { ...mockIngredient, id: 'item-1', name: 'Item 1' },
        { ...mockIngredient, id: 'item-2', name: 'Item 2' },
        { ...mockIngredient, id: 'item-3', name: 'Item 3' }
      ];

      const stateWithStack = {
        ...initialState,
        constructorItems: {
          ...initialState.constructorItems,
          ingredients: mockStack
        }
      };

      it('moves ingredient up in the stack', () => {
        const result = constructorSlice(stateWithStack, moveIngredientUp(2));
        
        expect(result.constructorItems.ingredients.map(i => i.id))
          .toEqual(['item-1', 'item-3', 'item-2']);
      });

      it('moves ingredient down in the stack', () => {
        const result = constructorSlice(stateWithStack, moveIngredientDown(0));
        
        expect(result.constructorItems.ingredients.map(i => i.id))
          .toEqual(['item-2', 'item-1', 'item-3']);
      });
    });
  });

  describe('Order Processing', () => {
    const mockOrderResponse = { order: { number: 12345 } };

    it('handles order submission lifecycle', () => {
      // Initial submission
      const submitting = constructorSlice(
        initialState,
        { type: orderBurger.pending.type }
      );
      expect(submitting.loading).toBeTruthy();
      expect(submitting.error).toBeNull();

      // Failed submission
      const failed = constructorSlice(
        submitting,
        { 
          type: orderBurger.rejected.type,
          error: { message: 'Network error occurred' }
        }
      );
      expect(failed.loading).toBeFalsy();
      expect(failed.error).toBe('Network error occurred');
      expect(failed.orderModalData).toBeNull();

      // Successful submission
      const completed = constructorSlice(
        submitting,
        {
          type: orderBurger.fulfilled.type,
          payload: mockOrderResponse
        }
      );
      expect(completed.loading).toBeFalsy();
      expect(completed.error).toBeNull();
      expect(completed.orderModalData?.number).toBe(mockOrderResponse.order.number);
    });
  });
});
