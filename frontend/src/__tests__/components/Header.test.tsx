import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/dashboard',
}));

const mockLogout = jest.fn();
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: jest.fn((selector) => {
    const state = {
      user: { id: '1', name: 'John Doe', email: 'john@test.com' },
      isAuthenticated: true,
      logout: mockLogout,
    };
    return selector ? selector(state) : state;
  }),
}));

import Header from '@/components/Header';

describe('Header', () => {
  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('should render the logo', () => {
    render(<Header />);
    expect(screen.getByText('VRealSoft')).toBeInTheDocument();
  });

  it('should show navigation links', () => {
    render(<Header />);
    expect(screen.getByText('My Files')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should display user name', () => {
    render(<Header />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should call logout on button click', () => {
    render(<Header />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });
});
