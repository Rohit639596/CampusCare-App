import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';
export default function Navbar({ user, logout }) {
  const navigate = useNavigate();
  return <header className="nav"><Link className="brand" to={user ? (user.role === 'ADMIN' ? '/admin' : '/dashboard') : '/'}><span className="brand-icon"><ShieldCheck size={21}/></span><span>CampusCare</span></Link>{user && <div className="nav-right"><span className="user-pill">{user.name} · {user.role === 'ADMIN' ? 'Admin' : 'Student'}</span><button className="icon-btn" onClick={logout} title="Logout"><LogOut size={18}/></button></div>}{!user && <button className="text-link" onClick={() => navigate('/login')}>Sign in</button>}</header>;
}
