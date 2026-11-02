import { useEffect, useState, type FormEvent } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

type User = { id: number; name: string; email: string; roles?: string[]; permissions?: string[] };
type Dashboard = { pages: number; programmes: number; newEnquiries: number; activeUsers: number };

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const form = new FormData(event.currentTarget);
    try { const result = await api<{ data: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); onLogin(result.data); }
    catch (e) { setError(e instanceof Error ? e.message : 'Sign in failed'); }
    finally { setBusy(false); }
  }
  return <main className="login-wrap"><form className="panel login" onSubmit={submit}><p className="eyebrow">Content management</p><h1>Sign in</h1><label>Email<input name="email" type="email" autoComplete="username" required maxLength={254}/></label><label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={256}/></label>{error && <p className="error" role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></main>;
}

function DashboardView() {
  const [data, setData] = useState<Dashboard | null>(null); const [error, setError] = useState('');
  useEffect(() => { api<{ data: Dashboard }>('/admin/dashboard').then((r) => setData(r.data)).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load dashboard')); }, []);
  return <section><h1>Dashboard</h1><p>CMS foundation is connected to the API.</p>{error && <p className="error" role="alert">{error}</p>}{data ? <div className="stats">{Object.entries(data).map(([label, value]) => <article className="panel" key={label}><span>{label.replace(/[A-Z]/g, (m) => ` ${m}`).toLowerCase()}</span><strong>{value}</strong></article>)}</div> : !error && <p aria-live="polite">Loading…</p>}</section>;
}

export function App() {
  const [user, setUser] = useState<User | null>(null); const [checking, setChecking] = useState(true); const navigate = useNavigate();
  useEffect(() => { api<{ data: User }>('/auth/me').then((r) => setUser(r.data)).catch(() => setUser(null)).finally(() => setChecking(false)); }, []);
  async function logout() { await api('/auth/logout', { method: 'POST' }).catch(() => undefined); setUser(null); navigate('/'); }
  if (checking) return <main className="login-wrap"><p aria-live="polite">Checking session…</p></main>;
  if (!user) return <Login onLogin={(next) => { setUser(next); navigate('/'); }} />;
  return <div className="admin-shell"><aside className="sidebar"><Link className="brand" to="/">VS Medu CMS</Link><nav aria-label="Admin navigation"><Link to="/">Dashboard</Link><span>Pages</span><span>Programmes</span><span>Enquiries</span><span>Settings</span></nav><button className="secondary" onClick={logout}>Sign out</button></aside><main className="content"><p className="user">{user.name} · {user.email}</p><Routes><Route path="/" element={<DashboardView/>}/><Route path="*" element={<DashboardView/>}/></Routes></main></div>;
}
