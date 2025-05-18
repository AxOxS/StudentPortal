import { useEffect, useState } from "react";
import axios from "axios";
import { updateGrade, deleteGrade } from "../api/student";
import { getToken } from "../api/auth";
import '../styles/TeacherPage.css';

const TeacherPage = () => {
    const [grades, setGrades] = useState([]);
    const [editingGrade, setEditingGrade] = useState(null);
    const [studentId, setStudentId] = useState("");
    const [subject, setSubject] = useState("");
    const [score, setScore] = useState("");
    const [maxScore, setMaxScore] = useState("100");
    const [gradeType, setGradeType] = useState("0");
    const [semester, setSemester] = useState("2024-1");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If there's a specific studentId entered, fetch grades for that student
        if (studentId) {
            fetchGradesForStudent(studentId);
        }
    }, []);

    const fetchGradesForStudent = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            const response = await axios.get(`http://localhost:5267/api/grades/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setGrades(response.data);
        } catch (err) {
            console.error("Error fetching grades:", err);
            setError("Failed to fetch grades. Please check the student ID and try again.");
            setGrades([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (studentId) {
            fetchGradesForStudent(studentId);
        } else {
            setError("Please enter a student ID");
        }
    };

    const handleEdit = (grade) => {
        setEditingGrade(grade);
        setSubject(grade.subject);
        setScore(grade.score);
        setMaxScore(grade.maxScore);
        setGradeType(grade.gradeType.toString());
        setSemester(grade.semester);
        setComments(grade.comments || "");
    };

    const verifyOrCreateStudent = async (studentId) => {
        try {
            setLoading(true);
            
            try {
                // Get all students and find the one we want
                const token = getToken();
                const studentsResponse = await axios.get(`http://localhost:5267/api/students`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("Students response:", studentsResponse.data);
                
                // Find the student with the matching ID
                const student = studentsResponse.data.find(s => s.id === parseInt(studentId));
                
                if (student) {
                    // Student exists, we can proceed
                    return true;
                }
                
                // If we got here, student wasn't found
                setError("Student ID not found in the system");
                return false;
            } catch (err) {
                console.error("Error verifying student:", err);
                setError("Failed to verify student: " + (err.response?.data || err.message));
                return false;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGrade = async () => {
        const token = getToken();
        
        if (editingGrade) {
            // Update existing grade
            try {
                await updateGrade(editingGrade.id, {
                    studentId: parseInt(editingGrade.studentId),
                    subject: subject,
                    score: parseFloat(score),
                    maxScore: parseFloat(maxScore),
                    gradeType: parseInt(gradeType),
                    semester: semester,
                    comments: comments || "",
                    date: new Date().toISOString(),
                });
                alert("Grade updated!");
                fetchGradesForStudent(editingGrade.studentId);
                cancelEdit(); // Reset form after successful update
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message;
                setError(errorMessage);
                alert(`Failed to update grade: ${errorMessage}`);
                console.error("Error details:", err.response);
            }
        } else {
            // Add new grade
            if (!studentId || !subject || !score) {
                setError("Please fill in all required fields");
                return;
            }

            // Verify and create student record if needed
            const studentExists = await verifyOrCreateStudent(studentId);
            if (!studentExists) {
                setError("Cannot add grade: Not a valid student");
                return;
            }

            try {
                // Validate numeric fields
                const parsedStudentId = parseInt(studentId);
                const parsedScore = parseFloat(score);
                const parsedMaxScore = parseFloat(maxScore);
                const parsedGradeType = parseInt(gradeType);

                if (isNaN(parsedStudentId) || isNaN(parsedScore) || isNaN(parsedMaxScore) || isNaN(parsedGradeType)) {
                    setError("Invalid numeric values provided");
                    return;
                }

                const gradeData = {
                    studentId: parsedStudentId,
                    subject: subject.trim(),
                    score: parsedScore,
                    maxScore: parsedMaxScore,
                    gradeType: parsedGradeType,
                    semester: semester.trim(),
                    comments: (comments || "").trim(),
                    date: new Date().toISOString(),
                };

                console.log("Sending grade data:", gradeData);

                const response = await axios.post(
                    `http://localhost:5267/api/grades`,
                    gradeData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log("Grade added response:", response);
                alert("Grade added!");
                fetchGradesForStudent(studentId);
                
                // Reset form 
                setEditingGrade(null);
                setSubject("");
                setScore("");
                setMaxScore("100");
                setGradeType("0");
                setComments("");
                setError(null);
            } catch (err) {
                const errorResponse = err.response?.data;
                const errorMessage = typeof errorResponse === 'object' ? 
                    errorResponse.message || JSON.stringify(errorResponse) : 
                    err.message;
                
                console.error("Error adding grade:", {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    error: err
                });
                
                setError(errorMessage);
                alert(`Failed to add grade: ${errorMessage}`);
            }
        }
    };

    const handleDelete = async (id, gradeStudentId) => {
        if (window.confirm("Are you sure you want to delete this grade?")) {
            try {
                await deleteGrade(id);
                alert("Grade deleted!");
                fetchGradesForStudent(gradeStudentId);
            } catch (err) {
                alert("Failed to delete grade");
                console.error(err);
            }
        }
    };

    const cancelEdit = () => {
        setEditingGrade(null);
        setSubject("");
        setScore("");
        setMaxScore("100");
        setGradeType("0");
        setSemester("2024-1");
        setComments("");
    };

    // Function to get grade type text
    const getGradeTypeText = (type) => {
        const types = ["Homework", "Quiz", "Exam", "Project", "Participation", "Final Exam"];
        return types[type] || "Unknown";
    };

    return (
        <div className="teacher-container">
            <div className="teacher-header">
                <h2>Teacher Dashboard</h2>
            </div>

            {/* Search Student Grades */}
            <div className="teacher-section">
                <h3>Find Student Grades</h3>
                <div className="search-container">
                    <input 
                        className="search-input"
                        type="text" 
                        placeholder="Enter Student ID" 
                        value={studentId} 
                        onChange={(e) => setStudentId(e.target.value)} 
                    />
                    <button className="search-button" onClick={handleSearch}>Search</button>
                </div>

                {loading && <p className="loading-message">Loading...</p>}
                {error && <p className="error-message">{error}</p>}
            </div>

            {/* Add/Edit Grade Form */}
            {studentId && (
                <div className="teacher-section">
                    <h3>{editingGrade ? "Edit Grade" : "Add Grade"}</h3>
                    <div className="grade-form">
                        {!editingGrade && (
                            <p>Adding grade for Student ID: {studentId}</p>
                        )}
                        
                        <div className="form-row">
                            <input 
                                className="form-field"
                                type="text" 
                                placeholder="Subject" 
                                value={subject} 
                                onChange={(e) => setSubject(e.target.value)} 
                            />
                            
                            <select 
                                className="form-field form-field-select"
                                value={gradeType} 
                                onChange={(e) => setGradeType(e.target.value)}
                            >
                                <option value="0">Homework</option>
                                <option value="1">Quiz</option>
                                <option value="2">Exam</option>
                                <option value="3">Project</option>
                                <option value="4">Participation</option>
                                <option value="5">Final Exam</option>
                            </select>
                        </div>
                        
                        <div className="form-row">
                            <input 
                                className="form-field"
                                type="number" 
                                placeholder="Score" 
                                value={score} 
                                onChange={(e) => setScore(e.target.value)} 
                            />
                            
                            <input 
                                className="form-field"
                                type="number" 
                                placeholder="Max Score" 
                                value={maxScore} 
                                onChange={(e) => setMaxScore(e.target.value)} 
                            />
                        </div>
                        
                        <input 
                            className="form-field"
                            type="text" 
                            placeholder="Semester (e.g., 2024-1)" 
                            value={semester} 
                            onChange={(e) => setSemester(e.target.value)} 
                        />
                        
                        <textarea 
                            className="form-field form-textarea"
                            placeholder="Comments (optional)" 
                            value={comments} 
                            onChange={(e) => setComments(e.target.value)}
                            rows={3}
                        />
                        
                        <div className="form-actions">
                            <button className="form-button" onClick={handleUpdateGrade}>
                                {editingGrade ? "Update Grade" : "Add Grade"}
                            </button>
                            
                            {editingGrade && (
                                <button className="form-button secondary" onClick={cancelEdit}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Display Grades */}
            {grades.length > 0 && (
                <div className="teacher-section">
                    <h3>Grades for Student ID: {grades[0]?.studentId}</h3>
                    <ul className="grades-list">
                        {grades.map((grade) => (
                            <li key={grade.id} className="grade-item">
                                <div className="grade-info">
                                    <div className="grade-subject">{grade.subject}</div>
                                    <div className="grade-details">
                                        <span className="grade-score">{grade.score}/{grade.maxScore}</span>
                                        <span className="grade-type">{getGradeTypeText(grade.gradeType)}</span>
                                        {grade.comments && (
                                            <div>
                                                <small>Comments: {grade.comments}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grade-actions">
                                    <button className="grade-button edit" onClick={() => handleEdit(grade)}>
                                        Edit
                                    </button>
                                    <button className="grade-button delete" onClick={() => handleDelete(grade.id, grade.studentId)}>
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {studentId && grades.length === 0 && !loading && (
                <div className="teacher-section">
                    <p className="no-results">No grades found for this student.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherPage;
