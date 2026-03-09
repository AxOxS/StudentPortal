// Tests for the student API utility module (src/api/student.js)

import axios from 'axios';
import { getToken } from '../api/auth';
import {
  getStudentByUserId,
  getGrades,
  getSchedule,
  updateGrade,
  deleteGrade,
  addSchedule,
} from '../api/student';

jest.mock('axios');
jest.mock('../api/auth');

// ─── helpers ─────────────────────────────────────────────────────────────────

const MOCK_TOKEN = 'Bearer mock.token';
const AUTH_HEADER = { Authorization: `Bearer ${MOCK_TOKEN}` };

beforeEach(() => {
  jest.clearAllMocks();
  getToken.mockReturnValue(MOCK_TOKEN);
});

// ══════════════════════════════════════════════════════════════════════════════
//  getStudentByUserId()
// ══════════════════════════════════════════════════════════════════════════════

describe('getStudentByUserId()', () => {
  const students = [
    { id: 1, userId: 10, user: { name: 'Alice' } },
    { id: 2, userId: 20, user: { name: 'Bob'   } },
  ];

  test('returns the correct student for a given userId', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: students });

    // Act
    const result = await getStudentByUserId(10);

    // Assert
    expect(result).toEqual(students[0]);
  });

  test('returns undefined when userId does not match any student', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: students });

    // Act
    const result = await getStudentByUserId(999);

    // Assert
    expect(result).toBeUndefined();
  });

  test('sends authorization header', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: students });

    // Act
    await getStudentByUserId(10);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${MOCK_TOKEN}` }) })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  getGrades()
// ══════════════════════════════════════════════════════════════════════════════

describe('getGrades()', () => {
  const mockGrades = [
    { id: 1, subject: 'Math',    score: 80, maxScore: 100, semester: 'S1' },
    { id: 2, subject: 'Physics', score: 70, maxScore: 100, semester: 'S1' },
  ];

  test('returns grades array for a student', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: mockGrades });

    // Act
    const result = await getGrades(1);

    // Assert
    expect(result).toEqual(mockGrades);
    expect(result).toHaveLength(2);
  });

  test('calls correct endpoint with studentId', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: mockGrades });

    // Act
    await getGrades(42);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/grades/42'),
      expect.any(Object)
    );
  });

  test('returns empty array when no grades exist', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: [] });

    // Act
    const result = await getGrades(1);

    // Assert
    expect(result).toEqual([]);
  });

  test('throws on network error', async () => {
    // Arrange
    axios.get.mockRejectedValue(new Error('Network error'));

    // Act & Assert
    await expect(getGrades(1)).rejects.toThrow('Network error');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  getSchedule()
// ══════════════════════════════════════════════════════════════════════════════

describe('getSchedule()', () => {
  const mockSchedule = [
    { id: 1, subject: 'Math', dayOfWeek: 1, room: '101', semester: 'S1' },
  ];

  test('returns schedule for a student', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: mockSchedule });

    // Act
    const result = await getSchedule(1);

    // Assert
    expect(result).toEqual(mockSchedule);
  });

  test('calls correct endpoint', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: mockSchedule });

    // Act
    await getSchedule(7);

    // Assert
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/schedule/7'),
      expect.any(Object)
    );
  });

  test('returns empty array when no schedule exists', async () => {
    // Arrange
    axios.get.mockResolvedValue({ data: [] });

    // Act
    const result = await getSchedule(1);

    // Assert
    expect(result).toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  updateGrade()
// ══════════════════════════════════════════════════════════════════════════════

describe('updateGrade()', () => {
  test('calls PUT with correct id and data', async () => {
    // Arrange
    axios.put.mockResolvedValue({});
    const updatedData = { subject: 'Math', score: 95 };

    // Act
    await updateGrade(5, updatedData);

    // Assert
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/grades/5'),
      updatedData,
      expect.any(Object)
    );
  });

  test('throws when update fails', async () => {
    // Arrange
    axios.put.mockRejectedValue({ response: { status: 404 } });

    // Act & Assert
    await expect(updateGrade(9999, {})).rejects.toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  deleteGrade()
// ══════════════════════════════════════════════════════════════════════════════

describe('deleteGrade()', () => {
  test('calls DELETE with correct gradeId', async () => {
    // Arrange
    axios.delete.mockResolvedValue({});

    // Act
    await deleteGrade(3);

    // Assert
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/grades/3'),
      expect.any(Object)
    );
  });

  test('throws when deleting non-existent grade', async () => {
    // Arrange
    axios.delete.mockRejectedValue({ response: { status: 404 } });

    // Act & Assert
    await expect(deleteGrade(9999)).rejects.toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  addSchedule()
// ══════════════════════════════════════════════════════════════════════════════

describe('addSchedule()', () => {
  const scheduleInput = {
    studentId: 1,
    subject:   'Math',
    startTime: '08:00',
    endTime:   '09:30',
    dayOfWeek: 1,
    room:      '101',
    semester:  '2024-S1',
    isActive:  true,
  };

  test('appends seconds to startTime and endTime before sending', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: { id: 1 } });

    // Act
    await addSchedule(scheduleInput);

    // Assert
    const sentData = axios.post.mock.calls[0][1];
    expect(sentData.startTime).toBe('08:00:00');
    expect(sentData.endTime).toBe('09:30:00');
  });

  test('calls correct endpoint', async () => {
    // Arrange
    axios.post.mockResolvedValue({ data: { id: 1 } });

    // Act
    await addSchedule(scheduleInput);

    // Assert
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/schedule'),
      expect.any(Object),
      expect.any(Object)
    );
  });

  test('returns response data on success', async () => {
    // Arrange
    const responseData = { id: 42, subject: 'Math' };
    axios.post.mockResolvedValue({ data: responseData });

    // Act
    const result = await addSchedule(scheduleInput);

    // Assert
    expect(result).toEqual(responseData);
  });

  test('throws and re-throws on API error', async () => {
    // Arrange
    axios.post.mockRejectedValue({ response: { status: 400, data: { error: 'Student not found' } } });

    // Act & Assert
    await expect(addSchedule(scheduleInput)).rejects.toBeDefined();
  });
});
