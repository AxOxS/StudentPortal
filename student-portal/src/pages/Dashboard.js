import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getToken } from "../api/auth";
import axios from "axios";
import "../styles/Dashboard.css";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [studentCount, setStudentCount] = useState(0);
    const [recentGrades, setRecentGrades] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const token = getToken();
                
                // Fetch students count
                const studentsResponse = await axios.get("http://localhost:5267/api/students", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStudentCount(studentsResponse.data.length);
                
                // For demo purposes, create some fake announcements
                setAnnouncements([
                    { 
                        id: 1, 
                        title: "End of Semester Approaching", 
                        content: "Please submit all assignments by December 15th.",
                        date: "2024-11-20",
                        author: "Admin"
                    },
                    { 
                        id: 2, 
                        title: "Holiday Break Schedule", 
                        content: "The campus will be closed from December 23rd to January 3rd.",
                        date: "2024-11-15",
                        author: "Admin"
                    },
                    { 
                        id: 3, 
                        title: "New Course Registration", 
                        content: "Registration for Spring semester opens on December 1st.",
                        date: "2024-11-10",
                        author: "Academic Office"
                    }
                ]);
                
                // If user is a student, fetch their recent grades
                if (user.role === "Student") {
                    try {
                        // Get the student's ID first (assuming there's an endpoint)
                        const studentData = await axios.get(`http://localhost:5267/api/students/user/${user.id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        
                        if (studentData?.data?.id) {
                            // Now fetch grades with that student ID
                            const gradesResponse = await axios.get(`http://localhost:5267/api/grades/${studentData.data.id}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            
                            // Sort by date and take latest 5
                            const sortedGrades = gradesResponse.data
                                .sort((a, b) => new Date(b.date) - new Date(a.date))
                                .slice(0, 5);
                            
                            setRecentGrades(sortedGrades);
                        }
                    } catch (error) {
                        console.error("Error fetching student-specific data:", error);
                        // Even if this fails, we can continue with other dashboard data
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    if (loading) {
        return <div className="dashboard-container">Loading dashboard...</div>;
    }

    // Get current date for display
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="dashboard-welcome">{getGreeting()}, {user?.name || user?.role || 'User'} • {currentDate}</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <p className="stat-title">Total Students</p>
                    <p className="stat-number">{studentCount}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Courses</p>
                    <p className="stat-number">{user?.role === "Teacher" ? 5 : 4}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Assignments</p>
                    <p className="stat-number">{user?.role === "Teacher" ? 12 : 8}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-title">Average Grade</p>
                    <p className="stat-number">{user?.role === "Student" ? "8.5" : "-"}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-grid">
                {/* Role-specific Card */}
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h2>Quick Access</h2>
                    </div>
                    <div className="dashboard-card-body">
                        {user?.role === "Student" && (
                            <>
                                <p>Navigate to your student portal to view detailed information about your courses, grades, and schedule.</p>
                                <div className="dashboard-card-footer">
                                    <Link to="/student" className="dashboard-button">View Student Portal</Link>
                                </div>
                            </>
                        )}
                        
                        {user?.role === "Teacher" && (
                            <>
                                <p>Access the teacher portal to manage grades, view student information, and update course materials.</p>
                                <div className="dashboard-card-footer">
                                    <Link to="/teacher" className="dashboard-button">View Teacher Portal</Link>
                                </div>
                            </>
                        )}
                        
                        {user?.role === "Admin" && (
                            <>
                                <p>Access the admin panel to manage users, courses, and system settings.</p>
                                <div className="dashboard-card-footer">
                                    <Link to="/admin" className="dashboard-button">View Admin Panel</Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Announcements Card */}
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h2>Announcements</h2>
                    </div>
                    <div className="dashboard-card-body">
                        {announcements.length > 0 ? (
                            <ul className="activity-list">
                                {announcements.map(announcement => (
                                    <li key={announcement.id} className="activity-item">
                                        <div className="activity-icon">📢</div>
                                        <div className="activity-content">
                                            <div className="activity-title">{announcement.title}</div>
                                            <div>{announcement.content}</div>
                                            <div className="activity-time">{announcement.date} • {announcement.author}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📢</div>
                                <p>No announcements at this time</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Grades for Students */}
                {user?.role === "Student" && (
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h2>Recent Grades</h2>
                        </div>
                        <div className="dashboard-card-body">
                            {recentGrades.length > 0 ? (
                                <ul className="activity-list">
                                    {recentGrades.map(grade => (
                                        <li key={grade.id} className="activity-item">
                                            <div className="activity-icon">📝</div>
                                            <div className="activity-content">
                                                <div className="activity-title">{grade.subject}</div>
                                                <div>Score: {grade.score}/{grade.maxScore}</div>
                                                <div className="activity-time">{new Date(grade.date).toLocaleDateString()}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📚</div>
                                    <p>No recent grades available</p>
                                </div>
                            )}
                        </div>
                        <div className="dashboard-card-footer">
                            <Link to="/student" className="dashboard-button">View All Grades</Link>
                        </div>
                    </div>
                )}

                {/* Profile Card */}
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h2>Profile Settings</h2>
                    </div>
                    <div className="dashboard-card-body">
                        <p>Update your personal information, email, or password in your profile settings.</p>
                    </div>
                    <div className="dashboard-card-footer">
                        <Link to="/profile" className="dashboard-button">Edit Profile</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
