import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  KeyRound,
  UserPlus,
  Home
} from 'lucide-react';

import { api } from '../lib/api';

export default function WardenRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    wardenKey: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.wardenKey
    ) {
      setError('Please fill all fields.');
      return;
    }

    if (form.password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        '/auth/warden/register',
        {
          name: form.name,
          email: form.email,
          password: form.password,
          wardenKey: form.wardenKey
        }
      );

      navigate('/warden/login');

    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Warden registration failed.'
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
              <UserPlus size={38} />
            </div>

            <h1>
              Join CampusCare
              <br />
              as a Warden
            </h1>

            <p>
              Create your authorized warden account
              to manage hostel complaints and
              support students.
            </p>

            <div className="warden-feature-list">

              <div className="warden-feature">
                <ShieldCheck size={20} />
                <span>
                  Manage Hostel Complaints
                </span>
              </div>

              <div className="warden-feature">
                <UserPlus size={20} />
                <span>
                  Support Hostel Students
                </span>
              </div>

              <div className="warden-feature">
                <KeyRound size={20} />
                <span>
                  Secure Warden Access
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* RIGHT SIDE */}
        <section className="warden-form-card">

          <div className="warden-card-icon">
            <UserPlus size={27} />
          </div>

          <h2>
            Warden Registration
          </h2>

          <p className="warden-card-subtitle">
            Create your official warden account.
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

            {/* NAME */}
            <div className="warden-field">

              <label htmlFor="warden-name">
                Full Name
              </label>

              <div className="warden-input">

                <User size={18} />

                <input
                  id="warden-name"
                  name="name"
                  type="text"
                  value={form.name}
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>

            {/* EMAIL */}
            <div className="warden-field">

              <label htmlFor="warden-register-email">
                Email Address
              </label>

              <div className="warden-input">

                <Mail size={18} />

                <input
                  id="warden-register-email"
                  name="email"
                  type="email"
                  value={form.email}
                  placeholder="Enter your email address"
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="warden-field">

              <label htmlFor="warden-register-password">
                Password
              </label>

              <div className="warden-input">

                <Lock size={18} />

                <input
                  id="warden-register-password"
                  name="password"
                  type="password"
                  value={form.password}
                  placeholder="Create a password"
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

              <small className="warden-field-hint">
                Minimum 6 characters
              </small>

            </div>

            {/* REGISTRATION KEY */}
            <div className="warden-field">

              <label htmlFor="warden-registration-key">
                Warden Registration Key
              </label>

              <div className="warden-input">

                <KeyRound size={18} />

                <input
                  id="warden-registration-key"
                  name="wardenKey"
                  type="password"
                  value={form.registrationKey}
                  placeholder="Enter registration key"
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

              <small className="warden-field-hint">
                Enter the authorized key provided by
                the administrator.
              </small>

            </div>

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="warden-primary-btn"
              disabled={loading}
            >

              <UserPlus size={18} />

              {loading
                ? 'Creating account...'
                : 'Create Warden Account'}

            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="warden-switch">

            <span>
              Already have a warden account?
            </span>

            <Link to="/warden/login">
              Login here
            </Link>

          </div>

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