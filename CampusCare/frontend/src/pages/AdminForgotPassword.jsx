import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();


  const findAccount = async e => {
    e.preventDefault();

    setError('');
    setMessage('');
    setBusy(true);

    try {
      const response = await api.post(
        '/auth/admin/forgot-password',
        { email }
      );

      setProfile(response.data.profile);
      setCodeSent(true);
      setMessage(
        'Reset code generated. Check the backend terminal.'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Admin account not found.'
      );
    } finally {
      setBusy(false);
    }
  };


  const changePassword = async e => {
    e.preventDefault();

    setError('');
    setMessage('');
    setBusy(true);

    try {
      const response = await api.post(
        '/auth/admin/reset-password',
        {
          email,
          code,
          newPassword
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate('/admin/login');
      }, 1200);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to change password.'
      );
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="auth-shell admin-auth">
      <div className="auth-card">

        <div className="logo-large">
          <ShieldCheck />
        </div>

        <p className="eyebrow">
          CAMPUSCARE · ADMIN
        </p>

        <h1>Forgot Admin Password?</h1>

        <p className="muted">
          Verify your admin account and create a new password.
        </p>


        {!codeSent && (
          <form
            onSubmit={findAccount}
            className="form"
          >

            <label>
              Admin Email

              <input
                type="email"
                required
                value={email}
                onChange={e =>
                  setEmail(e.target.value)
                }
                placeholder="admin@college.edu"
              />
            </label>


            {error && (
              <div className="error">
                {error}
              </div>
            )}


            <button
              className="primary"
              disabled={busy}
            >
              {busy
                ? 'Checking...'
                : 'Find My Admin Account'}
            </button>

          </form>
        )}


        {profile && (
          <div className="profile-box">

            <h3>Admin Account Found ✓</h3>

            <p>
              <strong>Name:</strong>{' '}
              {profile.name}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {profile.email}
            </p>

            <p>
              <strong>Account:</strong>{' '}
              Administrator
            </p>

          </div>
        )}


        {codeSent && (
          <form
            onSubmit={changePassword}
            className="form"
          >

            <label>
              6-Digit Reset Code

              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={e =>
                  setCode(
                    e.target.value.replace(/\D/g, '')
                  )
                }
                placeholder="Enter reset code"
              />
            </label>


            <label>
              New Password

              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e =>
                  setNewPassword(e.target.value)
                }
                placeholder="Minimum 8 characters"
              />
            </label>


            {error && (
              <div className="error">
                {error}
              </div>
            )}


            {message && (
              <div className="success">
                {message}
              </div>
            )}


            <button
              className="primary"
              disabled={busy}
            >
              {busy
                ? 'Changing Password...'
                : 'Change Admin Password'}
            </button>

          </form>
        )}


        <p className="switch">
          <Link to="/admin/login">
            ← Back to Admin Login
          </Link>
        </p>

      </div>
    </div>
  );
}