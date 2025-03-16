import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getGrades, getSchedule, getStudentByUserId } from "../api/student";

const StudentPage = () => {
    const { user } = useContext(AuthContext);
    const [grades, setGrades] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to group grades by subject
    const groupGradesBySubject = (grades) => {
        const groupedGrades = {};
        grades.forEach(grade => {
            if (!groupedGrades[grade.subject]) {
                groupedGrades[grade.subject] = [];
            }
            groupedGrades[grade.subject].push(grade.score);
        });
        return groupedGrades;
    };

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user) {
                try {
                    console.log('Current user:', user);
                    // First get the student record using the user's ID
                    const studentInfo = await getStudentByUserId(user.id);
                    console.log('Found student info:', studentInfo);
                    
                    if (studentInfo) {
                        // Now use the student's ID to fetch grades and schedule
                        const [gradesData, scheduleData] = await Promise.all([
                            getGrades(studentInfo.id),
                            getSchedule(studentInfo.id)
                        ]);
                        
                        console.log('Grades data:', gradesData);
                        console.log('Schedule data:', scheduleData);
                        
                        setGrades(gradesData);
                        setSchedule(scheduleData);
                    } else {
                        console.log('No student info found for user:', user);
                        setError("Student information not found");
                    }
                } catch (err) {
                    console.error("Error fetching student data:", err);
                    setError("Failed to load student data");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStudentData();
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Group the grades by subject
    const groupedGrades = groupGradesBySubject(grades);

    return (
        <div>
            <h2>Student Dashboard</h2>

            <h3>Your Grades</h3>
            {Object.keys(groupedGrades).length > 0 ? (
                <ul>
                    {Object.entries(groupedGrades).map(([subject, scores]) => (
                        <li key={subject}>
                            {subject}: {scores.join(', ')}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No grades available</p>
            )}

            <h3>Your Schedule</h3>
            {schedule.length > 0 ? (
                <ul>
                    {schedule.map((item) => (
                        <li key={item.id}>{item.subject} - {item.time} - Room {item.room}</li>
                    ))}
                </ul>
            ) : (
                <p>No schedule available</p>
            )}
        </div>
    );
};

export default StudentPage;
