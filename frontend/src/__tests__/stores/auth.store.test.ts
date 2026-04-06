import { useAuthStore } from '@/stores/auth.store';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    });
    localStorage.clear();
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set auth data', () => {
    const user = { id: '1', name: 'John', email: 'john@test.com' };
    const token = 'test-token';

    useAuthStore.getState().setAuth(token, user);
    const state = useAuthStore.getState();

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear auth data on logout', () => {
    const user = { id: '1', name: 'John', email: 'john@test.com' };
    useAuthStore.getState().setAuth('token', user);

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should initialize from localStorage', () => {
    localStorage.setItem('token', 'stored-token');
    useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.token).toBe('stored-token');
  });
});
