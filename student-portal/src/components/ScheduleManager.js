import React, { useState } from 'react';
import { addSchedule, updateSchedule, deleteSchedule } from '../api/student';
import '../styles/ScheduleManager.css';

const ScheduleManager = ({ schedules, studentId, onScheduleUpdate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        subject: '',
        startTime: '',
        endTime: '',
        dayOfWeek: 'Monday',
        room: '',
        semester: '',
        isActive: true
    });
    const [validationError, setValidationError] = useState('');

    // Define days of week to match C# DayOfWeek enum (Sunday=0, Monday=1, etc.)
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Map for converting day names to their enum values
    const dayToEnum = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6
    };
    
    // Map for converting enum values back to day names
    const enumToDay = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday'
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setValidationError(''); // Clear any validation errors when input changes
    };

    // Helper function to check if two time ranges overlap
    const checkTimeOverlap = (startTime1, endTime1, startTime2, endTime2) => {
        return (startTime1 < endTime2 && startTime2 < endTime1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert day name to enum number (0-6)
            const dayOfWeekNumber = dayToEnum[formData.dayOfWeek];
            
            // Validate that end time is after start time
            if (formData.startTime >= formData.endTime) {
                setValidationError("End time must be after start time");
                return;
            }
            
            // Check for time conflicts with existing schedules on the same day
            const conflictingSchedules = schedules.filter(schedule => {
                // Skip check against the schedule being edited
                if (editingSchedule && schedule.id === editingSchedule.id) {
                    return false;
                }
                
                // Check if on same day
                const scheduleDay = typeof schedule.dayOfWeek === 'number' ? 
                    schedule.dayOfWeek : dayToEnum[schedule.dayOfWeek];
                
                if (scheduleDay === dayOfWeekNumber) {
                    // Check if time slots overlap
                    const newStartTime = formData.startTime;
                    const newEndTime = formData.endTime;
                    const existingStartTime = formatTimeDisplay(schedule.startTime);
                    const existingEndTime = formatTimeDisplay(schedule.endTime);
                    
                    return checkTimeOverlap(newStartTime, newEndTime, existingStartTime, existingEndTime);
                }
                
                return false;
            });
            
            if (conflictingSchedules.length > 0) {
                setValidationError(`Time conflict with existing lesson: ${conflictingSchedules[0].subject} (${formatTimeDisplay(conflictingSchedules[0].startTime)} - ${formatTimeDisplay(conflictingSchedules[0].endTime)})`);
                return;
            }
            
            const scheduleData = {
                ...formData,
                studentId: studentId,
                startTime: formData.startTime,
                endTime: formData.endTime,
                dayOfWeek: dayOfWeekNumber
            };

            console.log('Sending schedule data to server:', JSON.stringify(scheduleData, null, 2));
            console.log('Day of week conversion:', formData.dayOfWeek, '->', dayOfWeekNumber);
            
            if (editingSchedule) {
                await updateSchedule(editingSchedule.id, scheduleData);
                console.log('Update successful');
            } else {
                const result = await addSchedule(scheduleData);
                console.log('Add successful:', result);
            }

            onScheduleUpdate();
            resetForm();
        } catch (error) {
            console.error('Error saving schedule:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                if (error.response.data && error.response.data.errors) {
                    // Log the specific validation errors
                    console.error('Validation errors:', error.response.data.errors);
                }
            }
        }
    };

    const handleDelete = async (scheduleId) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            try {
                await deleteSchedule(scheduleId);
                onScheduleUpdate();
            } catch (error) {
                console.error('Error deleting schedule:', error);
            }
        }
    };

    // Helper function to format time string for display
    const formatTimeDisplay = (timeString) => {
        if (!timeString) return '';
        
        // If it already has the format "HH:MM" or "HH:MM:SS", extract just "HH:MM"
        if (timeString.includes(':')) {
            return timeString.substring(0, 5);
        }
        
        return timeString;
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            subject: schedule.subject,
            startTime: formatTimeDisplay(schedule.startTime),
            endTime: formatTimeDisplay(schedule.endTime),
            dayOfWeek: typeof schedule.dayOfWeek === 'number' ? enumToDay[schedule.dayOfWeek] : schedule.dayOfWeek,
            room: schedule.room,
            semester: schedule.semester,
            isActive: schedule.isActive
        });
        setIsAdding(true);
    };

    const resetForm = () => {
        setFormData({
            subject: '',
            startTime: '',
            endTime: '',
            dayOfWeek: 'Monday',
            room: '',
            semester: '',
            isActive: true
        });
        setEditingSchedule(null);
        setIsAdding(false);
        setValidationError(''); // Clear validation errors
    };

    // Helper function to organize schedules by day and sort by time
    const getOrganizedSchedules = () => {
        // Create an object with arrays for each day
        const organizedSchedules = {
            1: [], // Monday
            2: [], // Tuesday
            3: [], // Wednesday
            4: [], // Thursday
            5: [], // Friday
            6: [], // Saturday
            0: []  // Sunday
        };
        
        // Group schedules by day of week
        schedules.forEach(schedule => {
            const day = typeof schedule.dayOfWeek === 'number' ? 
                schedule.dayOfWeek : 
                dayToEnum[schedule.dayOfWeek];
                
            if (organizedSchedules[day]) {
                organizedSchedules[day].push(schedule);
            }
        });
        
        // Sort each day's schedules by start time
        Object.keys(organizedSchedules).forEach(day => {
            organizedSchedules[day].sort((a, b) => {
                const timeA = a.startTime;
                const timeB = b.startTime;
                return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
            });
        });
        
        return organizedSchedules;
    };

    return (
        <div className="schedule-manager">
            <h3>Schedule Management</h3>
            
            {!isAdding ? (
                <button onClick={() => setIsAdding(true)}>Add New Schedule</button>
            ) : (
                <form onSubmit={handleSubmit} className="schedule-form">
                    {validationError && (
                        <div className="validation-error">{validationError}</div>
                    )}
                    <div>
                        <label>Subject:</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Start Time:</label>
                        <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>End Time:</label>
                        <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Day of Week:</label>
                        <select
                            name="dayOfWeek"
                            value={formData.dayOfWeek}
                            onChange={handleInputChange}
                            required
                        >
                            {daysOfWeek.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Room:</label>
                        <input
                            type="text"
                            name="room"
                            value={formData.room}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Semester:</label>
                        <input
                            type="text"
                            name="semester"
                            value={formData.semester}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                            />
                            Active
                        </label>
                    </div>
                    <div className="form-buttons">
                        <button type="submit">{editingSchedule ? 'Update' : 'Add'} Schedule</button>
                        <button type="button" onClick={resetForm}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="schedule-view">
                <h4>Weekly Schedule</h4>
                {schedules.length > 0 ? (
                    <div className="weekly-schedule">
                        {[1, 2, 3, 4, 5, 6, 0].map(dayNum => {
                            const dayName = enumToDay[dayNum];
                            const daySchedules = getOrganizedSchedules()[dayNum];
                            
                            return (
                                <div className="day-column" key={dayNum}>
                                    <h5 className="day-header">{dayName}</h5>
                                    <div className="day-schedules">
                                        {daySchedules.length > 0 ? (
                                            daySchedules.map(item => (
                                                <div 
                                                    className={`schedule-block ${!item.isActive ? 'inactive' : ''}`} 
                                                    key={item.id}
                                                >
                                                    <div className="schedule-time">
                                                        <span className="time-icon">⏰</span>
                                                        {formatTimeDisplay(item.startTime)} - {formatTimeDisplay(item.endTime)}
                                                    </div>
                                                    <div className="schedule-content">
                                                        <strong>{item.subject}</strong>
                                                        <div><span className="content-icon">🏢</span> {item.room}</div>
                                                        <div><span className="content-icon">📅</span> {item.semester}</div>
                                                    </div>
                                                    <div className="schedule-actions">
                                                        <button onClick={() => handleEdit(item)}>Edit</button>
                                                        <button onClick={() => handleDelete(item.id)}>Delete</button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-schedule">No classes</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No schedule available</p>
                )}
            </div>
        </div>
    );
};

export default ScheduleManager; 