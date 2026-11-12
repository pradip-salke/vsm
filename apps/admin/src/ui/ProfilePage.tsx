import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Icon } from './Icon';
import type { AdminUser } from './LoginPage';

type Props = { user: AdminUser; onUserUpdate: (user: AdminUser) => void; onLogout: () => void };

export function ProfilePage({ user, onUserUpdate, onLogout }: Props) {
  const [name, setName] = useState(user.name ?? '');
  const [username, setUsername] = useState(user.email ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(user.name ?? '');
    setUsername(user.email ?? '');
  }, [user.name, user.email]);

  const wantsPasswordChange = Boolean(newPassword.trim() || oldPassword.trim() || retypePassword.trim());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const normalizedUsername = username.trim().toLowerCase();
    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedUsername) || normalizedUsername.length > 254) {
      setError('Enter a valid username email address.');
      return;
    }

    if (wantsPasswordChange) {
      if (!oldPassword) {
        setError('Enter your current password to set a new one.');
        return;
      }
      if (newPassword.length < 8) {
        setError('New password must be at least 8 characters.');
        return;
      }
      if (newPassword !== retypePassword) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    const profileChanged = trimmedName !== (user.name ?? '').trim() || normalizedUsername !== (user.email ?? '').trim().toLowerCase();

    setBusy(true);
    try {
      if (profileChanged) {
        const patch = await api<{ data: AdminUser }>('/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify({ name: trimmedName, email: normalizedUsername }),
        });
        onUserUpdate({ ...user, ...patch.data });
        setSuccess('Profile updated.');
      }

      if (wantsPasswordChange) {
        await api<void>('/auth/password', {
          method: 'POST',
          body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
        });
        setOldPassword('');
        setNewPassword('');
        setRetypePassword('');
        await onLogout();
        return;
      }

      if (!profileChanged && !wantsPasswordChange) {
        setSuccess('No changes to save.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cms-editor cms-profile-page">
      <header className="page-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Settings</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">My Profile</span>
          </nav>
          <h1>Profile</h1>
          <p className="page-description">Update your admin display name and change your password when needed.</p>
        </div>
      </header>

      {error && (
        <div className="inline-error cms-profile-alert" role="alert">
          <Icon name="shield" size={18} />
          <p>{error}</p>
        </div>
      )}
      {success && !error && (
        <div className="cms-profile-success" role="status">
          <Icon name="check" size={18} />
          <p>{success}</p>
        </div>
      )}

      <form className="cms-profile-form" onSubmit={submit} noValidate>
        <section className="cms-section-card" aria-labelledby="profile-admin-info-heading">
          <div className="cms-section-card-header">
            <div className="cms-section-card-title-group">
              <div className="cms-section-card-index" aria-hidden>
                <Icon name="user" size={15} />
              </div>
              <div>
                <h2 id="profile-admin-info-heading" className="cms-section-card-heading">
                  Admin info
                </h2>
                <p className="cms-section-card-subheading">Your name appears in the workspace header and activity logs.</p>
              </div>
            </div>
          </div>
          <div className="cms-section-card-body">
            <fieldset className="cms-fields">
              <legend className="cms-visually-hidden">Admin details</legend>
              <label className="cms-field cms-field--long">
                <span>
                  Name <span className="cms-required">*</span>
                </span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={160}
                  disabled={busy}
                />
              </label>
              <label className="cms-field cms-field--long">
                <span>
                  Username <span className="cms-required">*</span>
                </span>
                <input
                  name="username"
                  type="email"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  maxLength={254}
                  disabled={busy}
                  placeholder="admin@vsmedu.in"
                />
              </label>
            </fieldset>

            <h3 className="cms-profile-subsection-title">Change password</h3>
            <p className="cms-profile-subsection-desc">Leave password fields blank to keep your current password. Changing your password signs you out on all devices.</p>

            <fieldset className="cms-fields">
              <legend className="cms-visually-hidden">Password</legend>
              <label className="cms-field">
                <span>Old password</span>
                <div className="cms-password-input-wrap">
                <input
                  name="oldPassword"
                  type={showOldPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={oldPassword}
                  onChange={(event) => setOldPassword(event.target.value)}
                  disabled={busy}
                  placeholder="Required if setting a new password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowOldPassword((visible) => !visible)} aria-label={showOldPassword ? 'Hide old password' : 'Show old password'} aria-pressed={showOldPassword} title={showOldPassword ? 'Hide password' : 'Show password'}><Icon name={showOldPassword ? 'eyeOff' : 'eye'} size={18} /></button>
                </div>
              </label>
              <label className="cms-field">
                <span>New password</span>
                <div className="cms-password-input-wrap">
                <input
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={busy}
                  placeholder="Min. 8 characters"
                />
                <button type="button" className="password-toggle" onClick={() => setShowNewPassword((visible) => !visible)} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'} aria-pressed={showNewPassword} title={showNewPassword ? 'Hide password' : 'Show password'}><Icon name={showNewPassword ? 'eyeOff' : 'eye'} size={18} /></button>
                </div>
              </label>
              <label className="cms-field cms-field--long">
                <span>Retype new password</span>
                <div className="cms-password-input-wrap">
                <input
                  name="retypePassword"
                  type={showRetypePassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={retypePassword}
                  onChange={(event) => setRetypePassword(event.target.value)}
                  disabled={busy}
                />
                <button type="button" className="password-toggle" onClick={() => setShowRetypePassword((visible) => !visible)} aria-label={showRetypePassword ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showRetypePassword} title={showRetypePassword ? 'Hide password' : 'Show password'}><Icon name={showRetypePassword ? 'eyeOff' : 'eye'} size={18} /></button>
                </div>
              </label>
            </fieldset>

            <div className="cms-profile-actions">
              <button type="button" className="cms-secondary cms-profile-logout" disabled={busy} onClick={() => void onLogout()}>
                <Icon name="logout" size={17} />
                Logout
              </button>
              <button type="submit" className="cms-primary cms-profile-submit" disabled={busy}>
                {busy ? <span className="button-spinner" aria-hidden /> : <Icon name="check" size={17} />}
                Update profile
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
