import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './lib/api';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function Protected({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => { api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('campuscare_token')).finally(() => setLoading(false)); }, []);
  const logout = () => { localStorage.removeItem('campuscare_token'); setUser(null); navigate('/login'); };
  if (loading) return <div className="loader">Loading CampusCare...</div>;
  return <div className="app"><Navbar user={user} logout={logout}/><main><Routes>
    <Route path="/" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/login'} replace />} />
    <Route path="/login" element={<Login onLogin={setUser} />} />
    <Route path="/register" element={<Register onLogin={setUser} />} />
    <Route path="/dashboard" element={<Protected user={user} role="STUDENT"><StudentDashboard user={user}/></Protected>} />
    <Route path="/admin" element={<Protected user={user} role="ADMIN"><AdminDashboard/></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main></div>;
}
