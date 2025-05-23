import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/navbar';

//roles
import StudentPage from './pages/StudentPage';
import TeacherPage from './pages/TeacherPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/dashboard" element={<PrivateRoute allowedRoles={['Student','Teacher', 'Admin']}><Dashboard /></PrivateRoute>} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/profile" element={<PrivateRoute allowedRoles={['Student','Teacher', 'Admin']}><ProfilePage /></PrivateRoute>} />
              <Route path="/student" element={<PrivateRoute allowedRoles={['Student']}><StudentPage /></PrivateRoute>} />
              <Route path="/teacher" element={<PrivateRoute allowedRoles={['Teacher']}><TeacherPage /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute allowedRoles={['Admin']}><AdminPage /></PrivateRoute>} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;