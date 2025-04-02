import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getGrades, getSchedule, getStudentByUserId } from "../api/student";
import ScheduleManager from "../components/ScheduleManager";

const StudentPage = () => {
    const { user } = useContext(AuthContext);
    const [grades, setGrades] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
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

    const fetchStudentData = async () => {
        if (user) {
            try {
                console.log('Current user:', user);
                // First get the student record using the user's ID
                const studentData = await getStudentByUserId(user.id);
                console.log('Found student info:', studentData);
                
                if (studentData) {
                    setStudentInfo(studentData);
                    // Now use the student's ID to fetch grades and schedule
                    const [gradesData, scheduleData] = await Promise.all([
                        getGrades(studentData.id),
                        getSchedule(studentData.id)
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

    useEffect(() => {
        fetchStudentData();
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Group the grades by subject
    const groupedGrades = groupGradesBySubject(grades);

    return (
        <div className="student-page">
            <h2>Student Dashboard</h2>

            <div className="grades-section">
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
            </div>

            {studentInfo && (
                <ScheduleManager 
                    schedules={schedule}
                    studentId={studentInfo.id}
                    onScheduleUpdate={fetchStudentData}
                />
            )}
        </div>
    );
};

export default StudentPage;
