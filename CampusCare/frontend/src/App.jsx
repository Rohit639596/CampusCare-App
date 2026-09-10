import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';

import { api } from './lib/api';

import Home from './pages/Home';

// Student Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

// Common
import Navbar from './components/Navbar';


// =====================================================
// PROTECTED ROUTE
// =====================================================

function Protected({ user, role, children }) {
  // User login nahi hai
  if (!user) {
    return (
      <Navigate
        to={role === 'ADMIN' ? '/admin/login' : '/login'}
        replace
      />
    );
  }

  // Wrong role
  if (role && user.role !== role) {
    return (
      <Navigate
        to={
          user.role === 'ADMIN'
            ? '/admin'
            : '/dashboard'
        }
        replace
      />
    );
  }

  return children;
}


// =====================================================
// APP
// =====================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  // ===================================================
  // CHECK EXISTING LOGIN
  // ===================================================

  useEffect(() => {
    const token = localStorage.getItem(
      'campuscare_token'
    );

    // Token nahi hai to login check ki zarurat nahi
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem(
          'campuscare_token'
        );

        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem(
      'campuscare_token'
    );

    setUser(null);

    navigate('/login');
  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="loader">
        Loading CampusCare...
      </div>
    );
  }


  // ===================================================
  // ROUTES
  // ===================================================

  return (
    <div className="app">

      <Navbar
        user={user}
        logout={logout}
      />

      <main>
        <Routes>


          {/* =========================================
              HOME
          ========================================= */}

        <Route path="/" element={<Home />} />


          {/* =========================================
              STUDENT AUTH
          ========================================= */}

          <Route
            path="/login"
            element={
              <Login
                onLogin={setUser}
              />
            }
          />

          <Route
            path="/register"
            element={
              <Register
                onLogin={setUser}
              />
            }
          />

          <Route
            path="/forgot-password"
            element={
              <ForgotPassword />
            }
          />


          {/* =========================================
              STUDENT DASHBOARD
          ========================================= */}

          <Route
            path="/dashboard"
            element={
              <Protected
                user={user}
                role="STUDENT"
              >
                <StudentDashboard
                  user={user}
                />
              </Protected>
            }
          />


          {/* =========================================
              ADMIN AUTH
          ========================================= */}

          <Route
            path="/admin/login"
            element={
              <AdminLogin
                onLogin={setUser}
              />
            }
          />

          <Route
            path="/admin/register"
            element={
              <AdminRegister
                onLogin={setUser}
              />
            }
          />

          <Route
            path="/admin/forgot-password"
            element={
              <AdminForgotPassword />
            }
          />


          {/* =========================================
              ADMIN DASHBOARD
          ========================================= */}

          <Route
            path="/admin"
            element={
              <Protected
                user={user}
                role="ADMIN"
              >
                <AdminDashboard />
              </Protected>
            }
          />


          {/* =========================================
              UNKNOWN URL
          ========================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </main>

    </div>
  );
}