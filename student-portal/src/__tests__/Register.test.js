// Tests for Register page component (src/pages/Register.js)
// Uses React Testing Library with mocked axios and routing.

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Register from '../pages/Register';

// ─── mocks ───────────────────────────────────────────────────────────────────

jest.mock('axios');

// ─── helpers ─────────────────────────────────────────────────────────────────

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
//  Rendering
// ══════════════════════════════════════════════════════════════════════════════

describe('Register – rendering', () => {
  test('renders all required input fields', () => {
    // Act
    renderRegister();

    // Assert
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('renders the Create Account submit button', () => {
    // Act
    renderRegister();

    // Assert
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('renders a link to the login page', () => {
    // Act
    renderRegister();

    // Assert
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  test('does not show error or success messages by default', () => {
    // Act
    renderRegister();

    // Assert
    expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/registered successfully/i)).not.toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  Form interaction
// ══════════════════════════════════════════════════════════════════════════════

describe('Register – form interaction', () => {
  test('updates name field when user types', async () => {
    // Arrange
    renderRegister();
    const nameInput = screen.getByLabelText(/full name/i);

    // Act
    await userEvent.type(nameInput, 'Jane Doe');

    // Assert
    expect(nameInput.value).toBe('Jane Doe');
  });

  test('updates email field when user types', async () => {
    // Arrange
    renderRegister();
    const emailInput = screen.getByLabelText(/email/i);

    // Act
    await userEvent.type(emailInput, 'jane@test.com');

    // Assert
    expect(emailInput.value).toBe('jane@test.com');
  });

  test('updates password field when user types', async () => {
    // Arrange
    renderRegister();
    const pwdInput = screen.getByLabelText(/password/i);

    // Act
    await userEvent.type(pwdInput, 'secret123');

    // Assert
    expect(pwdInput.value).toBe('secret123');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  Submission – success
// ══════════════════════════════════════════════════════════════════════════════

describe('Register – successful submission', () => {
  test('shows success message after successful registration', async () => {
    // Arrange
    axios.post.mockResolvedValue({ status: 200, data: { message: 'User registered successfully' } });
    renderRegister();

    // Act
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/registered successfully/i)).toBeInTheDocument()
    );
  });

  test('sends correct payload including passwordHash field', async () => {
    // Arrange
    axios.post.mockResolvedValue({ status: 200, data: {} });
    renderRegister();

    // Act
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'pass123');
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

    // Assert
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    const sentData = axios.post.mock.calls[0][1];
    expect(sentData).toMatchObject({
      name:         'Jane',
      email:        'jane@test.com',
      passwordHash: 'pass123',
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  Submission – failure
// ══════════════════════════════════════════════════════════════════════════════

describe('Register – failed submission', () => {
  test('shows error message when email already exists', async () => {
    // Arrange
    axios.post.mockRejectedValue({
      response: { data: 'Email already exists.' },
    });
    renderRegister();

    // Act
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/email/i), 'dup@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'pass123');
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    );
  });

  test('shows generic error message when request fails without a message', async () => {
    // Arrange
    axios.post.mockRejectedValue({ response: { data: null } });
    renderRegister();

    // Act
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'pass');
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument()
    );
  });

  test('does not show success message when registration fails', async () => {
    // Arrange
    axios.post.mockRejectedValue({ response: { data: 'Error' } });
    renderRegister();

    // Act
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form'));

    // Assert
    await waitFor(() =>
      expect(screen.queryByText(/registered successfully/i)).not.toBeInTheDocument()
    );
  });
});
