import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ShieldCheck } from 'lucide-react';
export default function Login({ onLogin }) {
  const [form,setForm]=useState({email:'',password:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const navigate=useNavigate();
  const submit=async e=>{e.preventDefault();setError('');setBusy(true);try{const r=await api.post('/auth/login',form);localStorage.setItem('campuscare_token',r.data.token);onLogin(r.data.user);navigate(r.data.user.role==='ADMIN'?'/admin':'/dashboard')}catch(err){setError(err.response?.data?.message||'Unable to sign in.')}finally{setBusy(false)}};
  return <div className="auth-shell"><div className="auth-card"><div className="logo-large"><ShieldCheck/></div><p className="eyebrow">CAMPUSCARE</p><h1>Welcome back</h1><p className="muted">Sign in to submit or manage campus complaints.</p><form onSubmit={submit} className="form"><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@college.edu"/></label><label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/></label>{error&&<div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy?'Signing in...':'Sign in'}</button></form><p className="switch">New here? <Link to="/register">Create student account</Link></p></div></div>;
}
