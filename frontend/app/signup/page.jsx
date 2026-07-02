'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch, ensureAuthenticatedSession } from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SignupPage() {
  const [form, setForm] = useState({ orgName: '', fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        orgName: form.orgName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      };
      await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setForm(payload);
      await ensureAuthenticatedSession();
      window.location.replace('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-view">
      <div className="login-card">
        <div className="brandmark">
          <img src="/logo.png" alt="" />
          <span>Digitpen Hub</span>
        </div>
        <h2>Start your free workspace</h2>
        <p className="login-sub">No credit card required. Every module — CRM, sites, invoicing, marketing — from day one.</p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Organization name"
            name="organization"
            autoComplete="organization"
            value={form.orgName}
            onChange={update('orgName')}
            placeholder="e.g. Acme Studio"
            required
            autoFocus
          />
          <Input
            label="Your name"
            name="name"
            autoComplete="name"
            value={form.fullName}
            onChange={update('fullName')}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={form.email}
            onChange={update('email')}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            helper="At least 8 characters."
            required
          />
          {error && <p className="error-note">{error}</p>}
          <Button className="w-full" type="submit" loading={loading}>
            {loading ? 'Creating your workspace…' : 'Create free account'}
          </Button>
        </form>
        <p className="login-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
