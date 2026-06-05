import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import AuthLayout from './AuthLayout.jsx';
import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import { useAuth } from '../../core/auth/AuthContext.jsx';
import { useToast } from '../../shared/components/Toast.jsx';
import authService from '../../core/services/authService.js';

export default function LoginPage() {
  const { login, completeOtpLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // OTP step state
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Invalid email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await login(form);
      // High-privilege accounts return otpRequired:true and no tokens.
      if (result?.otpRequired) {
        setOtpEmail(result.email || form.email.trim().toLowerCase());
        setOtpRequired(true);
        toast.success(`We've emailed a 6-digit code to ${result.email || form.email}.`);
        return;
      }
      toast.success(`Welcome back, ${result.fullName?.split(' ')[0] || result.email}`);
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.userMessage || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitOtp(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(otpCode)) {
      toast.error('Enter the 6-digit code from your email.');
      return;
    }
    setSubmitting(true);
    try {
      const auth = await authService.verifyOtp(otpEmail, otpCode);
      const u = await completeOtpLogin(auth);
      toast.success(`Verified. Welcome back, ${u.fullName?.split(' ')[0] || u.email}.`);
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.userMessage || 'That code didn\'t check out. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow={otpRequired ? 'Two-step verification' : 'Welcome back'}
      title={otpRequired ? 'Check your email' : 'Sign in to SkillSync'}
      subtitle={otpRequired
        ? `We sent a 6-digit code to ${otpEmail}. Enter it below to finish signing in.`
        : 'Pick up where you left off — your mentors and sessions are waiting.'}
    >
      {otpRequired ? (
        <form onSubmit={onSubmitOtp} className="col" style={{ gap: 16 }} noValidate>
          <Input
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <Button type="submit" block loading={submitting}>Verify and sign in</Button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { setOtpRequired(false); setOtpCode(''); }}
            disabled={submitting}
          >
            ← Use a different account
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="col" style={{ gap: 12 }} noValidate>
          <Input label="Email" name="email" type="email" autoComplete="email"
                 placeholder="you@example.com"
                 value={form.email} onChange={update('email')} error={errors.email} />
          <Input label="Password" name="password" type="password" autoComplete="current-password"
                 placeholder="••••••••"
                 value={form.password} onChange={update('password')} error={errors.password} />

          <div className="row between" style={{ marginTop: -2, marginBottom: 6 }}>
            <span />
            <Link to="/auth/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Link>
          </div>

          <Button type="submit" block loading={submitting}>Sign in</Button>

          <div className="row center" style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
            New to SkillSync?&nbsp;<Link to="/auth/register">Create an account</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
