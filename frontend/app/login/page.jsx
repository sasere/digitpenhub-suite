'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch, ensureAuthenticatedSession } from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA challenge step — set once login() responds with requiresMfa.
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const data = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      if (data.requiresMfa) {
        setMfaToken(data.mfaToken);
        return;
      }
      setEmail(normalizedEmail);
      // Wait until the cookie-backed session and the first dashboard payload
      // are both readable before leaving the auth page; otherwise a fast
      // redirect can briefly land on the signed-out shell and look like the
      // login bounced back to the public flow.
      await ensureAuthenticatedSession();
      window.location.replace('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/api/v1/auth/verify-mfa', {
        method: 'POST',
        body: JSON.stringify(
          useBackupCode ? { mfaToken, backupCode: mfaCode } : { mfaToken, code: mfaCode }
        ),
      });
      await ensureAuthenticatedSession();
      window.location.replace('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (mfaToken) {
    return (
      <div className="login-view">
        <div className="login-card">
          <div className="brandmark">
            <img src="/logo.png" alt="" />
            <span>Digitpen Hub</span>
          </div>
          <h2>Two-factor verification</h2>
          <p className="login-sub">
            {useBackupCode
              ? 'Enter one of your saved backup codes.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
          <form onSubmit={handleMfaSubmit}>
            <Input
              label={useBackupCode ? 'Backup code' : 'Authentication code'}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
              autoFocus
              autoComplete="one-time-code"
            />
            {error && <p className="error-note">{error}</p>}
            <Button className="w-full" type="submit" loading={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
          </form>
          <p className="login-foot">
            <button type="button" className="link-btn" onClick={() => { setUseBackupCode((v) => !v); setMfaCode(''); setError(''); }}>
              {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
            </button>
          </p>
          <p className="login-foot">
            <button type="button" className="link-btn" onClick={() => { setMfaToken(null); setMfaCode(''); setError(''); }}>
              ← Back to sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-view">
      <div className="login-card">
        <div className="brandmark">
          <img src="/logo.png" alt="" />
          <span>Digitpen Hub</span>
        </div>
        <h2>Sign in to your workspace</h2>
        <p className="login-sub">One secure login for every module, from CRM to billing and beyond.</p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="login-links-row">
            <Link href="/forgot-password" className="link-btn">Forgot password?</Link>
          </div>
          {error && <p className="error-note">{error}</p>}
          <Button className="w-full" type="submit" loading={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="login-foot">
          New to Digitpen Hub? <Link href="/signup">Create a free account</Link>
        </p>
        <p className="login-foot">suite.digitpenhub.com</p>
      </div>
    </div>
  );
}
