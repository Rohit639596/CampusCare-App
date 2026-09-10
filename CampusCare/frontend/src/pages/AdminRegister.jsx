import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export default function AdminRegister({ onLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    adminKey: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const update = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submit = async e => {
    e.preventDefault();

    setError('');
    setBusy(true);

    try {
      const response = await api.post(
        '/auth/admin/register',
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
        'Unable to create admin account.'
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

        <h1>Create Admin Account</h1>

        <p className="muted">
          Create an authorized administrator account.
        </p>

        <div className="security-badge">
          🔐 Authorized staff only
        </div>

        <form
          onSubmit={submit}
          className="form"
        >

          <label>
            Full Name

            <input
              type="text"
              required
              value={form.name}
              onChange={e =>
                update('name', e.target.value)
              }
              placeholder="Administrator name"
            />
          </label>


          <label>
            Admin Email

            <input
              type="email"
              required
              value={form.email}
              onChange={e =>
                update('email', e.target.value)
              }
              placeholder="admin@college.edu"
            />
          </label>


          <label>
            Password

            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={e =>
                update('password', e.target.value)
              }
              placeholder="Minimum 8 characters"
            />
          </label>


          <label>
            Admin Registration Key

            <input
              type="password"
              required
              value={form.adminKey}
              onChange={e =>
                update('adminKey', e.target.value)
              }
              placeholder="Enter admin key"
            />

            <span className="hint">
              This key is verified by the backend.
            </span>
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
              ? 'Creating account...'
              : 'Create Admin Account'}
          </button>

        </form>


        <p className="switch">
          Already an admin?{' '}
          <Link to="/admin/login">
            Admin Login
          </Link>
        </p>


        <p className="switch">
          <Link to="/login">
            ← Student Login
          </Link>
        </p>

      </div>
    </div>
  );
}