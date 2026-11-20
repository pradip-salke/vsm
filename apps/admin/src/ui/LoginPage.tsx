import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Icon } from './Icon';

export type AdminUser = { id?: number; userId?: number; name?: string; email: string; roles?: string[]; permissions?: string[]; menuVisibility?: string[] | null };

export function LoginPage({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ data: AdminUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: String(form.get('email') ?? '').trim(), password: String(form.get('password') ?? ''), rememberMe: form.get('rememberMe') === 'on' }),
      });
      const session = await api<{ data: AdminUser }>('/auth/me');
      onLogin({ ...result.data, ...session.data });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not sign you in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-page">
    <section className="login-brand-panel" aria-label="Valia School of Management CMS">
      <div className="login-brand-content">
        <img src="/images/brand/vsm-logo.svg" alt="Valia School of Management" className="login-logo" />
        <div className="login-brand-copy"><span className="login-kicker">Content management workspace</span><h1>Everything you need to manage the VSM website.</h1><p>A clear, secure workspace for the people shaping the Valia School of Management experience.</p></div>
        <div className="login-brand-footer"><span className="brand-status-dot" /> Secure administrator access <span className="brand-footer-separator">/</span> VSM CMS</div>
      </div>
      <div className="login-decoration login-decoration-one" aria-hidden="true" /><div className="login-decoration login-decoration-two" aria-hidden="true" />
    </section>
    <section className="login-form-panel">
      <div className="login-form-inner">
        <div className="login-mobile-brand"><img src="/images/brand/vsm-logo.svg" alt="Valia School of Management" /></div>
        <div className="login-heading"><span className="login-heading-icon"><Icon name="shield" size={21} /></span><p className="eyebrow">Administrator access</p><h2>Welcome back</h2><p className="login-subtitle">Sign in to continue to your VSM workspace.</p></div>
        <form className="login-form" onSubmit={submit}>
          <label className="field-label" htmlFor="admin-email">Email address</label>
          <div className="input-wrap"><Icon name="mail" size={18} /><input id="admin-email" name="email" type="email" autoComplete="username" placeholder="name@vsmedu.in" required maxLength={254} autoFocus /></div>
          <div className="password-label-row"><label className="field-label" htmlFor="admin-password">Password</label><a className="forgot-link" href="mailto:info@vsmedu.in?subject=Request%20for%20CMS%20password%20reset">Forgot password?</a></div>
          <div className="input-wrap password-wrap"><Icon name="lock" size={18} /><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required maxLength={256} /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} title={showPassword ? 'Hide password' : 'Show password'}><Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} /></button></div>
          <div className="login-options"><label className="checkbox-label"><input type="checkbox" name="rememberMe" /> <span>Remember me</span></label><span className="session-note"><Icon name="lock" size={13} /> Secure session</span></div>
          {error && <p className="login-error" role="alert"><Icon name="shield" size={17} />{error}</p>}
          <button className="login-submit" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" aria-hidden="true" /> Signing in...</> : <>Sign in to dashboard <Icon name="arrow" size={18} /></>}</button>
        </form>
        <p className="login-support">Need access? <a href="mailto:info@vsmedu.in?subject=VSM%20CMS%20administrator%20access">Contact the VSM administrator</a></p>
        <div className="login-security"><Icon name="shield" size={16} /><span>Your session is encrypted and protected.</span></div>
      </div>
    </section>
  </main>;
}
