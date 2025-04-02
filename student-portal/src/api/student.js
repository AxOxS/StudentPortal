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

export const addSchedule = async (scheduleData) => {
    const token = getToken();
    
    // Format data properly for the API
    const formattedData = {
        studentId: scheduleData.studentId,
        subject: scheduleData.subject,
        startTime: scheduleData.startTime + ":00", // Add seconds to match TimeSpan format
        endTime: scheduleData.endTime + ":00",     // Add seconds to match TimeSpan format
        dayOfWeek: scheduleData.dayOfWeek,
        room: scheduleData.room,
        semester: scheduleData.semester,
        isActive: scheduleData.isActive
    };
    
    console.log('Formatted data being sent:', formattedData);
    
    try {
        const response = await axios.post(`${API_URL}/schedule`, formattedData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Success response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in addSchedule:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        throw error;
    }
};

export const updateSchedule = async (scheduleId, updatedData) => {
    const token = getToken();
    
    // Only include required fields and format them properly
    const formattedData = {
        id: scheduleId,
        studentId: updatedData.studentId,
        subject: updatedData.subject,
        startTime: updatedData.startTime + ":00", // Add seconds to match TimeSpan format
        endTime: updatedData.endTime + ":00",     // Add seconds to match TimeSpan format
        dayOfWeek: updatedData.dayOfWeek,
        room: updatedData.room,
        semester: updatedData.semester,
        isActive: updatedData.isActive
    };
    
    console.log('Formatted update data being sent:', formattedData);
    
    await axios.put(`${API_URL}/schedule/${scheduleId}`, formattedData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

export const deleteSchedule = async (scheduleId) => {
    const token = getToken();
    await axios.delete(`${API_URL}/schedule/${scheduleId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};
