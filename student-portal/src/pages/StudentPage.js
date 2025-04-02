import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getGrades, getSchedule, getStudentByUserId } from "../api/student";
import ScheduleManager from "../components/ScheduleManager";
import '../styles/Dashboard.css';


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

    // Function to determine grade color class
    const getGradeColorClass = (score) => {
        if (score >= 9) return 'grade-a';
        if (score >= 8) return 'grade-b';
        if (score >= 6) return 'grade-c';
        if (score >= 5) return 'grade-d';
        return 'grade-f';
    };
    

    if (loading) return <div className="dashboard-container"><div className="dashboard-card">Loading...</div></div>;
    if (error) return <div className="dashboard-container"><div className="dashboard-card" style={{ borderLeft: '5px solid #f44336' }}>{error}</div></div>;

    // Group the grades by subject
    const groupedGrades = groupGradesBySubject(grades);

    // Calculate average grade for each subject
    const subjectAverages = {};
    Object.entries(groupedGrades).forEach(([subject, scores]) => {
        const sum = scores.reduce((total, score) => total + score, 0);
        subjectAverages[subject] = Math.round(sum / scores.length);
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Student Dashboard</h1>
            </div>

            {studentInfo && (
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h2>Student Information</h2>
                    </div>
                    <div className="profile-container">
                        <div className="profile-image">
                            <img src={studentInfo.profileImageUrl || '../../pics/cat'} alt={studentInfo.name} />
                        </div>
                        <div className="profile-details">
                            <div className="profile-detail">
                                <label>Name</label>
                                <span>{studentInfo.firstName} {studentInfo.lastName}</span>
                            </div>
                            <div className="profile-detail">
                                <label>Student ID</label>
                                <span>{studentInfo.id}</span>
                            </div>
                            <div className="profile-detail">
                                <label>Email</label>
                                <span>{studentInfo.email}</span>
                            </div>
                            <div className="profile-detail">
                                <label>Grade Level</label>
                                <span>{studentInfo.gradeLevel || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-card">
                <div className="dashboard-card-header">
                    <h2>Your Grades</h2>
                </div>
                
                {Object.keys(groupedGrades).length > 0 ? (
                    <div className="grades-table-container">
                        <table className="grades-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Scores</th>
                                    <th>Average</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedGrades).map(([subject, scores]) => (
                                    <tr key={subject}>
                                        <td><strong>{subject}</strong></td>
                                        <td>
                                            {scores.map((score, index) => (
                                                <span 
                                                    key={index} 
                                                    className={`grade-score ${getGradeColorClass(score)}`}
                                                    style={{margin: '0 4px'}}
                                                >
                                                    {score}
                                                </span>
                                            ))}
                                        </td>
                                        <td>
                                            <span className={`grade-score ${getGradeColorClass(subjectAverages[subject])}`}>
                                                {subjectAverages[subject]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-schedule">No grades available</p>
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
