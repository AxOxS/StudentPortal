// Tests for the auth API utility module (src/api/auth.js)
// Uses Jest's manual mocking for axios and localStorage to stay isolated.

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { login, register, logout, getToken, getUserRole } from '../api/auth';

jest.mock('axios');
jest.mock('jwt-decode');

// ─── helpers ─────────────────────────────────────────────────────────────────

const mockToken = 'mock.jwt.token';

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
//  login()
// ══════════════════════════════════════════════════════════════════════════════

describe('login()', () => {
  test('stores token in localStorage on success', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: { token: mockToken } });

    // Act
    await login('user@test.com', 'password');

    // Assert
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  test('returns response data', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: { token: mockToken } });

    // Act
    const result = await login('user@test.com', 'password');

    // Assert
    expect(result).toEqual({ token: mockToken });
  });

  test('calls the correct endpoint', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: { token: mockToken } });

    // Act
    await login('user@test.com', 'password');

    // Assert
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      { email: 'user@test.com', password: 'password' }
    );
  });

  test('does NOT store token when response has no token', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: {} });

    // Act
    await login('user@test.com', 'password');

    // Assert
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('throws when the API call fails', async () => {
    // Arrange
    axios.post.mockRejectedValue(new Error('Network error'));

    // Act & Assert
    await expect(login('user@test.com', 'password')).rejects.toThrow('Network error');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  register()
// ══════════════════════════════════════════════════════════════════════════════

describe('register()', () => {
  test('calls the register endpoint with correct payload', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: { message: 'User registered successfully' } });

    // Act
    await register('Jane Doe', 'jane@test.com', 'pass123', 'Student');

    // Assert
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/register'),
      { name: 'Jane Doe', email: 'jane@test.com', passwordHash: 'pass123', role: 'Student' }
    );
  });

  test('returns the response when registration succeeds', async () => {
    // Arrange
    const responseData = { data: { message: 'User registered successfully' } };
    axios.post.mockResolvedValue(responseData);

    // Act
    const result = await register('Jane', 'jane@test.com', 'pass', 'Student');

    // Assert
    expect(result).toBe(responseData);
  });

  test('throws when server rejects duplicate email', async () => {
    // Arrange
    axios.post.mockRejectedValue({ response: { data: 'Email already exists.' } });

    // Act & Assert
    await expect(register('Jane', 'dup@test.com', 'pass', 'Student')).rejects.toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  logout()
// ══════════════════════════════════════════════════════════════════════════════

describe('logout()', () => {
  test('removes token from localStorage', () => {
    // Arrange
    localStorage.setItem('token', mockToken);

    // Act
    logout();

    // Assert
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('does not throw when no token is present', () => {
    // Arrange – localStorage already empty from beforeEach

    // Act & Assert
    expect(() => logout()).not.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  getToken()
// ══════════════════════════════════════════════════════════════════════════════

describe('getToken()', () => {
  test('returns the token stored in localStorage', () => {
    // Arrange
    localStorage.setItem('token', mockToken);

    // Act & Assert
    expect(getToken()).toBe(mockToken);
  });

  test('returns null when no token is stored', () => {
    // Arrange – clean state from beforeEach

    // Act & Assert
    expect(getToken()).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  getUserRole()
// ══════════════════════════════════════════════════════════════════════════════

describe('getUserRole()', () => {
  test('returns null when no token is stored', () => {
    // Act & Assert
    expect(getUserRole()).toBeNull();
  });

  test('returns decoded role and id from token', () => {
    // Arrange
    localStorage.setItem('token', mockToken);
    jwtDecode.mockReturnValue({ role: 'Student', id: '42' });

    // Act
    const result = getUserRole();

    // Assert
    expect(result).toEqual({ role: 'Student', id: '42' });
  });

  test('returns null when token decoding throws', () => {
    // Arrange
    localStorage.setItem('token', 'bad.token');
    jwtDecode.mockImplementation(() => { throw new Error('invalid token'); });

    // Act
    const result = getUserRole();

    // Assert
    expect(result).toBeNull();
  });
});
