// Tests for the Login page component (src/pages/Login.js)
// Uses React Testing Library with mocked API and routing.

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import * as authApi from '../api/auth';
import { AuthContext } from '../context/AuthContext';

// ─── mocks ───────────────────────────────────────────────────────────────────

jest.mock('../api/auth');

// ─── helpers ─────────────────────────────────────────────────────────────────

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: null, setUser: jest.fn() }}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
//  Rendering
// ══════════════════════════════════════════════════════════════════════════════

describe('Login – rendering', () => {
  test('renders the email and password input fields', () => {
    // Act
    renderLogin();

    // Assert
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders the Sign In submit button', () => {
    // Act
    renderLogin();

    // Assert
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders a link to the register page', () => {
    // Act
    renderLogin();

    // Assert
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  test('does NOT show an error message by default', () => {
    // Act
    renderLogin();

    // Assert
    expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  Form interaction
// ══════════════════════════════════════════════════════════════════════════════

describe('Login – form interaction', () => {
  test('updates email field when user types', async () => {
    // Arrange
    renderLogin();
    const emailInput = screen.getByLabelText(/email/i);

    // Act
    await userEvent.type(emailInput, 'user@test.com');

    // Assert
    expect(emailInput.value).toBe('user@test.com');
  });

  test('updates password field when user types', async () => {
    // Arrange
    renderLogin();
    const passwordInput = screen.getByLabelText(/password/i);

    // Act
    await userEvent.type(passwordInput, 'secret');

    // Assert
    expect(passwordInput.value).toBe('secret');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  Submission – success
// ══════════════════════════════════════════════════════════════════════════════

describe('Login – successful submission', () => {
  test('calls login() with entered email and password', async () => {
    // Arrange
    authApi.login.mockResolvedValue({});
    authApi.getUserRole.mockReturnValue({ role: 'Student', id: '1' });
    renderLogin();

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));

    // Assert
    await waitFor(() =>
      expect(authApi.login).toHaveBeenCalledWith('user@test.com', 'password123')
    );
  });

  test('does NOT show error message on successful login', async () => {
    // Arrange
    authApi.login.mockResolvedValue({});
    authApi.getUserRole.mockReturnValue({ role: 'Student', id: '1' });
    renderLogin();

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));

    // Assert
    await waitFor(() =>
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument()
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  Submission – failure
// ══════════════════════════════════════════════════════════════════════════════

describe('Login – failed submission', () => {
  test('shows error message when login API throws', async () => {
    // Arrange
    authApi.login.mockRejectedValue(new Error('Unauthorized'));
    renderLogin();

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    );
  });

  test('clears previous error message when submitting again successfully', async () => {
    // Arrange – first attempt fails
    authApi.login.mockRejectedValueOnce(new Error('Unauthorized'));
    authApi.login.mockResolvedValueOnce({});
    authApi.getUserRole.mockReturnValue({ role: 'Student', id: '1' });
    renderLogin();

    // Act – first (failed) submit
    await userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'bad');
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));
    await waitFor(() => screen.getByText(/invalid email or password/i));

    // Act – second (successful) submit
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));

    // Assert – error must disappear
    await waitFor(() =>
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument()
    );
  });
});
