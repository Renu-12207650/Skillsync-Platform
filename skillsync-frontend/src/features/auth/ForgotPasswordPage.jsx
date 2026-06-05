import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from './AuthLayout.jsx';
import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import authService from '../../core/services/authService.js';
import { useToast } from '../../shared/components/Toast.jsx';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('email');

  async function onSubmit(e) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      setStep('code');
      toast.success(res.message || 'Reset code sent. Check your email.');
    } catch (err) {
      toast.error(err.userMessage || 'Could not initiate password reset');
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerify(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }
    navigate(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}&code=${code}`);
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter your email, then use the verification code we send to reset your password."
    >
      {step === 'email' ? (
        <form onSubmit={onSubmit} className="col" style={{ gap: 16 }} noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" block loading={submitting}>Send reset code</Button>
          <div className="row center" style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
            <Link to="/auth/login">← Back to sign in</Link>
          </div>
        </form>
      ) : (
        <div className="col" style={{ gap: 16 }}>
          <p style={{ color: 'var(--text-secondary)' }}>Enter the 6-digit verification code we emailed to you.</p>
          <form onSubmit={onVerify} className="col" style={{ gap: 16 }} noValidate>
            <Input
              label="Verification code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <Button type="submit" block>Continue to reset password</Button>
          </form>
        </div>
      )}
    </AuthLayout>
  );
}
