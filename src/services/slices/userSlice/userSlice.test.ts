import { PayloadAction } from '@reduxjs/toolkit';
import userSlice, {
  getUser,
  getOrdersAll,
  initialState,
  registerUser,
  loginUser,
  updateUser,
  logoutUser
} from './userSlice';

interface MockUser {
  name: string;
  email: string;
}

interface MockResponse<T> {
  user?: T;
  orders?: string[];
}

describe('User State Management', () => {
  const mockUserData: MockUser = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  const createActionSet = <T>(actionCreator: any, mockPayload?: T) => ({
    inProgress: {
      type: 'user/pending',
      payload: undefined
    },
    failure: {
      type: 'user/rejected',
      error: { message: 'Operation failed' }
    },
    success: {
      type: 'user/fulfilled',
      payload: mockPayload
    }
  });

  describe('Profile Data Operations', () => {
    const userActions = createActionSet<MockResponse<MockUser>>({ user: mockUserData });

    it('handles profile data fetch initiation', () => {
      const resultState = userSlice(initialState, {
        type: getUser.pending.type,
        payload: undefined
      });
      expect(resultState).toEqual({
        ...initialState,
        isAuthenticated: true,
        isAuthChecked: true,
        loginUserRequest: true
      });
    });

    it('handles profile data fetch failure', () => {
      const resultState = userSlice(initialState, {
        type: getUser.rejected.type,
        error: { message: 'Operation failed' }
      });
      expect(resultState).toEqual({
        ...initialState,
        isAuthenticated: false,
        isAuthChecked: false,
        loginUserRequest: false
      });
    });

    it('handles successful profile data retrieval', () => {
      const resultState = userSlice(initialState, {
        type: getUser.fulfilled.type,
        payload: { user: mockUserData }
      });
      expect(resultState).toEqual({
        ...initialState,
        isAuthenticated: true,
        loginUserRequest: false,
        userData: mockUserData,
        isAuthChecked: false
      });
    });
  });

  describe('Order History Management', () => {
    const mockOrders = ['order-123', 'order-456'];

    it('manages order history fetch lifecycle', () => {
      const loadingState = userSlice(initialState, {
        type: getOrdersAll.pending.type,
        payload: undefined
      });
      expect(loadingState.request).toBeTruthy();
      expect(loadingState.error).toBeNull();

      const errorState = userSlice(initialState, {
        type: getOrdersAll.rejected.type,
        error: { message: 'Operation failed' }
      });
      expect(errorState.error).toBe('Operation failed');
      expect(errorState.request).toBeFalsy();

      const successState = userSlice(initialState, {
        type: getOrdersAll.fulfilled.type,
        payload: mockOrders
      });
      expect(successState.userOrders).toEqual(mockOrders);
      expect(successState.error).toBeNull();
      expect(successState.request).toBeFalsy();
    });
  });

  describe('Authentication Flow', () => {
    it('handles registration process states', () => {
      const states = {
        registering: userSlice(initialState, {
          type: registerUser.pending.type,
          payload: undefined
        }),
        failed: userSlice(initialState, {
          type: registerUser.rejected.type,
          error: { message: 'Operation failed' }
        }),
        completed: userSlice(initialState, {
          type: registerUser.fulfilled.type,
          payload: { user: mockUserData }
        })
      };

      expect(states.registering.request).toBeTruthy();
      expect(states.registering.isAuthChecked).toBeTruthy();
      expect(states.registering.isAuthenticated).toBeFalsy();

      expect(states.failed.request).toBeFalsy();
      expect(states.failed.error).toBe('Operation failed');
      expect(states.failed.isAuthChecked).toBeFalsy();

      expect(states.completed.request).toBeFalsy();
      expect(states.completed.error).toBeNull();
      expect(states.completed.userData).toEqual(mockUserData);
      expect(states.completed.isAuthChecked).toBeFalsy();
      expect(states.completed.isAuthenticated).toBeTruthy();
    });

    it('manages login flow states', () => {
      const states = {
        authenticating: userSlice(initialState, {
          type: loginUser.pending.type,
          payload: undefined
        }),
        failed: userSlice(initialState, {
          type: loginUser.rejected.type,
          error: { message: 'Operation failed' }
        }),
        authenticated: userSlice(initialState, {
          type: loginUser.fulfilled.type,
          payload: { user: mockUserData }
        })
      };

      expect(states.authenticating.loginUserRequest).toBeTruthy();
      expect(states.authenticating.isAuthChecked).toBeTruthy();
      expect(states.authenticating.isAuthenticated).toBeFalsy();

      expect(states.failed.loginUserRequest).toBeFalsy();
      expect(states.failed.isAuthChecked).toBeFalsy();
      expect(states.failed.error).toBe('Operation failed');

      expect(states.authenticated.loginUserRequest).toBeFalsy();
      expect(states.authenticated.isAuthChecked).toBeFalsy();
      expect(states.authenticated.isAuthenticated).toBeTruthy();
      expect(states.authenticated.userData).toEqual(mockUserData);
    });

    it('handles logout process', () => {
      const states = {
        loggingOut: userSlice(initialState, {
          type: logoutUser.pending.type,
          payload: undefined
        }),
        failed: userSlice(initialState, {
          type: logoutUser.rejected.type,
          error: { message: 'Operation failed' }
        }),
        loggedOut: userSlice(initialState, {
          type: logoutUser.fulfilled.type,
          payload: null
        })
      };

      expect(states.loggingOut.isAuthChecked).toBeTruthy();
      expect(states.loggingOut.isAuthenticated).toBeTruthy();
      expect(states.loggingOut.request).toBeTruthy();
      expect(states.loggingOut.error).toBeNull();

      expect(states.failed.isAuthChecked).toBeFalsy();
      expect(states.failed.isAuthenticated).toBeTruthy();
      expect(states.failed.request).toBeFalsy();
      expect(states.failed.error).toBe('Operation failed');

      expect(states.loggedOut.isAuthChecked).toBeFalsy();
      expect(states.loggedOut.isAuthenticated).toBeFalsy();
      expect(states.loggedOut.request).toBeFalsy();
      expect(states.loggedOut.error).toBeNull();
      expect(states.loggedOut.userData).toBeNull();
    });
  });

  describe('Profile Updates', () => {
    it('handles profile update lifecycle', () => {
      const updating = userSlice(initialState, {
        type: updateUser.pending.type,
        payload: undefined
      });
      expect(updating.request).toBeTruthy();
      expect(updating.error).toBeNull();

      const failed = userSlice(initialState, {
        type: updateUser.rejected.type,
        error: { message: 'Operation failed' }
      });
      expect(failed.request).toBeFalsy();
      expect(failed.error).toBe('Operation failed');

      const updated = userSlice(initialState, {
        type: updateUser.fulfilled.type,
        payload: { user: mockUserData }
      });
      expect(updated.request).toBeFalsy();
      expect(updated.error).toBeNull();
      expect(updated.response).toEqual(mockUserData);
    });
  });
});
