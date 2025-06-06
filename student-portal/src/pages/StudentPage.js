import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getGrades, getSchedule, getStudentByUserId } from "../api/student";
import { getToken, getUserRole } from "../api/auth";
import axios from "axios";
import ScheduleManager from "../components/ScheduleManager";
import '../styles/Dashboard.css';
import '../styles/StudentPage.css';


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
            // Store the full grade object instead of just the score
            groupedGrades[grade.subject].push(grade);
        });
        return groupedGrades;
    };

    const fetchStudentData = async () => {
        if (user) {
            try {
                console.log('Current user:', user);
                const token = getToken();
                const userInfo = getUserRole();

                // First get the user information
                const userResponse = await axios.get(`http://localhost:5267/api/users/${userInfo.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('User details:', userResponse.data);

                // Then get the student record
                const studentData = await getStudentByUserId(user.id);
                console.log('Found student info:', studentData);
                
                if (studentData) {
                    // Combine user and student data
                    const combinedInfo = {
                        ...studentData,
                        firstName: userResponse.data.name.split(' ')[0],
                        lastName: userResponse.data.name.split(' ').length > 1 ? userResponse.data.name.split(' ')[1] : "",
                        email: userResponse.data.email
                    };
                    setStudentInfo(combinedInfo);

                    // Fetch grades and schedule
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
    
    // Function to get grade type text
    const getGradeTypeText = (type) => {
        const types = ["Homework", "Quiz", "Exam", "Project", "Participation", "Final Exam"];
        return types[type] || "Unknown";
    };

    if (loading) return <div className="dashboard-container"><div className="dashboard-card">Loading...</div></div>;
    if (error) return <div className="dashboard-container"><div className="dashboard-card" style={{ borderLeft: '5px solid #f44336' }}>{error}</div></div>;

    // Group the grades by subject
    const groupedGrades = groupGradesBySubject(grades);

    // Calculate average grade for each subject
    const subjectAverages = {};
    Object.entries(groupedGrades).forEach(([subject, gradeObjects]) => {
        const scores = gradeObjects.map(grade => grade.score);
        const sum = scores.reduce((total, score) => total + score, 0);
        subjectAverages[subject] = Math.round(sum / scores.length);
    });

    // Calculate overall grade average
    const calculateOverallAverage = () => {
        const averages = Object.values(subjectAverages);
        if (averages.length === 0) return "N/A";
        const sum = averages.reduce((total, avg) => total + avg, 0);
        return Math.round(sum / averages.length);
    };

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
                                <label>Grade Average</label>
                                <span className={`grade-score ${getGradeColorClass(calculateOverallAverage())}`}>
                                    {calculateOverallAverage()}
                                </span>
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
                                {Object.entries(groupedGrades).map(([subject, gradeObjects]) => (
                                    <tr key={subject}>
                                        <td><strong>{subject}</strong></td>
                                        <td>
                                            {gradeObjects.map((grade, index) => (
                                                <span 
                                                    key={index} 
                                                    className={`grade-score ${getGradeColorClass(grade.score)}`}
                                                    style={{cursor: 'help'}}
                                                    title={`Type: ${getGradeTypeText(grade.gradeType)}
Date: ${new Date(grade.date).toLocaleDateString()}
Semester: ${grade.semester}
Score: ${grade.score}/${grade.maxScore}
${grade.comments ? `Comments: ${grade.comments}` : 'No comments'}`}
                                                >
                                                    {grade.score}
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
