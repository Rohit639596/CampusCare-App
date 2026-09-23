import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function WardenForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');


  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        '/auth/warden/forgot-password',
        {
          email: email.trim()
        }
      );

      setSuccess(
        response.data?.message ||
        'If the email is registered, a password reset link has been sent.'
      );

      setEmail('');

    } catch (err) {
      console.error(
        'Warden forgot password error:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to process your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="auth-page warden-forgot-page">

      <div className="auth-card">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="auth-header">

          <div className="auth-logo">
            🔐
          </div>

          <p className="auth-eyebrow">
            CAMPUSCARE AI
          </p>

          <h1>
            Forgot Password?
          </h1>

          <p>
            Enter your registered warden email
            to receive a password reset link.
          </p>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}


        {/* ==================================================
            FORM
        ================================================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="warden-forgot-email">
              Warden Email
            </label>

            <input
              id="warden-forgot-email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />

          </div>


          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? 'Sending...'
              : 'Send Reset Link'}
          </button>

        </form>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="auth-footer">

          <button
            type="button"
            className="text-button"
            onClick={() =>
              navigate('/warden/login')
            }
          >
            ← Back to Warden Login
          </button>

        </div>

      </div>

    </div>
  );
}