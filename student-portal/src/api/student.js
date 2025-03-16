import axios from "axios";
import { getToken } from "./auth";

const API_URL = "http://localhost:5267/api";

// Get student info by user ID
export const getStudentByUserId = async (userId) => {
    const token = getToken();
    const response = await axios.get(`${API_URL}/students`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log('All students:', response.data);
    console.log('Looking for userId:', userId);
    console.log('Student IDs available:', response.data.map(s => `userId: ${s.userId}, id: ${s.id}`));
    
    // Find the student with matching userId
    const student = response.data.find(student => student.userId === parseInt(userId));
    console.log('Found student:', student);
    return student;
};

export const getGrades = async (studentId) => {
    const token = getToken();
    const response = await axios.get(`${API_URL}/grades/${studentId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const getSchedule = async (studentId) => {
    const token = getToken();
    const response = await axios.get(`${API_URL}/schedule/${studentId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

export const updateGrade = async (gradeId, updatedData) => {
    const token = getToken();
    await axios.put(`${API_URL}/grades/${gradeId}`, updatedData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const deleteGrade = async (gradeId) => {
    const token = getToken();
    await axios.delete(`${API_URL}/grades/${gradeId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
