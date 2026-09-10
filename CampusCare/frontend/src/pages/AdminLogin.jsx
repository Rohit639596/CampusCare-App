import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setBusy(true);

    try {
      const response = await api.post(
        '/auth/admin/login',
        form
      );

      localStorage.setItem(
        'campuscare_token',
        response.data.token
      );

      onLogin(response.data.user);

      navigate('/admin');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to sign in as admin.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell admin-auth">
      <div className="auth-card">

        {/* Logo */}
        <div className="logo-large">
          <ShieldCheck size={27} />
        </div>

        {/* Heading */}
        <p className="eyebrow">
          CAMPUSCARE · ADMINISTRATION
        </p>

        <h1>Admin Login</h1>

        <p className="muted">
          Restricted access for authorized campus staff.
        </p>

        {/* Security Badge */}
        <div className="security-badge">
          🔒 Authorized administrators only
        </div>

        {/* Login Form */}
        <form
          onSubmit={submit}
          className="form"
        >

          {/* Email */}
          <label>
            Admin Email

            <div className="input-icon">
              <Mail size={17} />

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
                placeholder="admin@college.edu"
              />
            </div>
          </label>


          {/* Password */}
          <label>
            Password

            <div className="input-icon">
              <Lock size={17} />

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
                placeholder="Admin password"
              />
            </div>
          </label>


          {/* Admin Forgot Password */}
          <div className="forgot-row">
            <Link to="/admin/forgot-password">
              Forgot admin password?
            </Link>
          </div>


          {/* Error */}
          {error && (
            <div className="error">
              {error}
            </div>
          )}


          {/* Login Button */}
          <button
            className="primary"
            disabled={busy}
          >
            {busy
              ? 'Signing in...'
              : 'Login as Administrator'}
          </button>

        </form>


        {/* Admin Registration */}
        <p className="switch">
          Need an admin account?{' '}

          <Link to="/admin/register">
            Create Admin Account
          </Link>
        </p>


        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>


        {/* Student Login */}
        <Link
          to="/login"
          className="admin-login-link"
        >
          ← Login as Student
        </Link>

      </div>
    </div>
  );
}