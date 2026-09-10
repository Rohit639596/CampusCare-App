import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  KeyRound,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState(null);

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [step, setStep] = useState(1);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const requestCode = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setBusy(true);

    try {
      const response = await api.post(
        '/auth/forgot-password',
        { email }
      );

      if (response.data.profile) {
        setProfile(response.data.profile);
      }

      setMessage(
        'Reset code generated. Check the backend terminal for the code.'
      );

      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to process request.'
      );
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setBusy(true);

    try {
      const response = await api.post(
        '/auth/reset-password',
        {
          email,
          code,
          newPassword
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate(
          profile?.role === 'ADMIN'
            ? '/admin/login'
            : '/login'
        );
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to reset password.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">

      <div className="auth-card">

        <div className="logo-large">
          <KeyRound size={26} />
        </div>

        <p className="eyebrow">
          CAMPUSCARE · ACCOUNT RECOVERY
        </p>

        <h1>Forgot Password?</h1>

        <p className="muted">
          Recover your account and create a new password.
        </p>

        {step === 1 && (
          <form
            className="form"
            onSubmit={requestCode}
          >

            <label>
              Registered Email

              <div className="input-icon">
                <Mail size={17} />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your registered email"
                />
              </div>
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
                ? 'Checking account...'
                : 'Continue'}
            </button>

          </form>
        )}

        {step === 2 && (
          <>
            {profile && (
              <div className="profile-preview">

                <div className="profile-avatar">
                  {profile.role === 'ADMIN'
                    ? <ShieldCheck size={24} />
                    : <User size={24} />}
                </div>

                <div>
                  <span className="label">
                    ACCOUNT FOUND
                  </span>

                  <h3>
                    {profile.name}
                  </h3>

                  <p>
                    {profile.email}
                  </p>

                  <span className="role-badge">
                    {profile.role === 'ADMIN'
                      ? 'Administrator'
                      : 'Student'}
                  </span>
                </div>

              </div>
            )}

            <form
              className="form"
              onSubmit={resetPassword}
            >

              <label>
                Reset Code

                <input
                  inputMode="numeric"
                  maxLength="6"
                  required
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit code"
                />
              </label>

              <label>
                New Password

                <input
                  type="password"
                  minLength="8"
                  required
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Minimum 8 characters"
                />
              </label>

              {message && (
                <div className="success">
                  {message}
                </div>
              )}

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
                  ? 'Changing password...'
                  : 'Change Password'}
              </button>

            </form>
          </>
        )}

        <p className="switch">
          Remember your password?{' '}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}