import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  Home
} from 'lucide-react';

import { api } from '../lib/api';

export default function WardenLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        '/auth/warden/login',
        {
          email,
          password
        }
      );

      const { token, user } = response.data;

      localStorage.setItem('campuscare_token', token);
      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );

      navigate('/warden/dashboard');

    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="warden-auth-page">

      <main className="warden-auth-container">

        {/* LEFT SIDE */}
        <section className="warden-info-panel">

          <div className="warden-info-content">

            <span className="warden-eyebrow">
              WARDEN PORTAL
            </span>

            <div className="warden-info-icon">
              <ShieldCheck size={38} />
            </div>

            <h1>
              Welcome Back,
              <br />
              Warden
            </h1>

            <p>
              Manage hostel complaints, update
              complaint status and help students
              get their issues resolved.
            </p>

            <div className="warden-feature-list">

              <div className="warden-feature">
                <ShieldCheck size={20} />
                <span>
                  View Hostel Complaints
                </span>
              </div>

              <div className="warden-feature">
                <LogIn size={20} />
                <span>
                  Update Complaint Status
                </span>
              </div>

              <div className="warden-feature">
                <UserPlus size={20} />
                <span>
                  Support Hostel Students
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* RIGHT SIDE */}
        <section className="warden-form-card">

          <div className="warden-card-icon">
            <ShieldCheck size={27} />
          </div>

          <h2>Warden Login</h2>

          <p className="warden-card-subtitle">
            Sign in to access your warden dashboard.
          </p>

          {error && (
            <div className="warden-error">
              {error}
            </div>
          )}

          <form
            className="warden-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}
            <div className="warden-field">

              <label htmlFor="warden-email">
                Email Address
              </label>

              <div className="warden-input">

                <Mail size={18} />

                <input
                  id="warden-email"
                  type="email"
                  value={email}
                  placeholder="Enter your email address"
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="warden-field">

              <label htmlFor="warden-password">
                Password
              </label>

              <div className="warden-input">

                <Lock size={18} />

                <input
                  id="warden-password"
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  disabled={loading}
                />

              </div>

            </div>

            {/* FORGOT PASSWORD */}
            <div className="warden-forgot-row">

              <span></span>

              <Link
                to="/warden/forgot-password"
                className="warden-forgot"
              >
                Forgot Password?
              </Link>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="warden-primary-btn"
              disabled={loading}
            >

              <LogIn size={18} />

              {loading
                ? 'Signing in...'
                : 'Login as Warden'}

            </button>

          </form>

          {/* DIVIDER */}
          <div className="warden-divider">
            <span>OR</span>
          </div>

          {/* REGISTER */}
          <Link
            to="/warden/register"
            className="warden-outline-btn"
          >
            <UserPlus size={18} />
            Register as Warden
          </Link>

          {/* HOME */}
          <Link
            to="/"
            className="warden-home-link"
          >
            <Home size={16} />
            Back to Home
          </Link>

        </section>

      </main>

    </div>
  );
}