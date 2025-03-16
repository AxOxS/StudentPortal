import { useEffect, useState } from "react";
import axios from "axios";
import { updateGrade, deleteGrade } from "../api/student";
import { getToken } from "../api/auth";

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
        try {
            await deleteGrade(id);
            alert("Grade deleted!");
            fetchGradesForStudent(gradeStudentId);
        } catch (err) {
            alert("Failed to delete grade");
            console.error(err);
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

    return (
        <div>
            <h2>Teacher Dashboard</h2>

            {/* Search Student Grades */}
            <h3>Find Student Grades</h3>
            <div>
                <input 
                    type="text" 
                    placeholder="Enter Student ID" 
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)} 
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Add/Edit Grade Form */}
            {studentId && (
                <>
                    <h3>{editingGrade ? "Edit Grade" : "Add Grade"}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                        {!editingGrade && (
                            <span>Adding grade for Student ID: {studentId}</span>
                        )}
                        <input 
                            type="text" 
                            placeholder="Subject" 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                        />
                        <input 
                            type="number" 
                            placeholder="Score" 
                            value={score} 
                            onChange={(e) => setScore(e.target.value)} 
                        />
                        <input 
                            type="number" 
                            placeholder="Max Score" 
                            value={maxScore} 
                            onChange={(e) => setMaxScore(e.target.value)} 
                        />
                        <select 
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
                        <input 
                            type="text" 
                            placeholder="Semester (e.g., 2024-1)" 
                            value={semester} 
                            onChange={(e) => setSemester(e.target.value)} 
                        />
                        <textarea 
                            placeholder="Comments (optional)" 
                            value={comments} 
                            onChange={(e) => setComments(e.target.value)}
                            rows={3}
                        />
                        <button onClick={handleUpdateGrade}>
                            {editingGrade ? "Update Grade" : "Add Grade"}
                        </button>
                        {editingGrade && <button onClick={cancelEdit}>Cancel</button>}
                    </div>
                </>
            )}

            {/* Display Grades */}
            {grades.length > 0 && (
                <>
                    <h3>Grades for Student ID: {grades[0]?.studentId}</h3>
                    <ul>
                        {grades.map((grade) => (
                            <li key={grade.id}>
                                {grade.subject} - {grade.score}/{grade.maxScore} ({grade.gradeType}) 
                                <button onClick={() => handleEdit(grade)}>Edit</button>
                                <button onClick={() => handleDelete(grade.id, grade.studentId)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default TeacherPage;
