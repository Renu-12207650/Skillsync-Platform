import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import AuthLayout from './AuthLayout.jsx';
import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import authService from '../../core/services/authService.js';
import { useToast } from '../../shared/components/Toast.jsx';

export default function ResetPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const email = params.get('email');
    const code = params.get('code');
    setForm((f) => ({
      ...f,
      email: email || f.email,
      code: /^\d{6}$/.test(code || '') ? code : f.code
    }));
  }, [params]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Invalid email';
    if (!/^\d{6}$/.test(form.code)) next.code = 'Verification code must be 6 digits';
    if (form.newPassword.length < 8) next.newPassword = 'Password must be at least 8 characters';
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authService.resetPassword({ token: `${form.email.trim().toLowerCase()}:${form.code}`, newPassword: form.newPassword });
      toast.success('Password reset! You can sign in now.');
      navigate('/auth/login', { replace: true });
    } catch (err) {
      toast.error(err.userMessage || 'Reset failed. Code may be invalid or expired.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="Use your email verification code and choose a strong new password."
    >
      <form onSubmit={onSubmit} className="col" style={{ gap: 16 }} noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Verification code"
          name="code"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
          error={errors.code}
          placeholder="123456"
        />
        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={update('newPassword')}
          error={errors.newPassword}
          placeholder="At least 8 characters"
        />
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
        />

        <Button type="submit" block loading={submitting}>Reset password</Button>

        <div className="row center" style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
          <Link to="/auth/login">← Back to sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
