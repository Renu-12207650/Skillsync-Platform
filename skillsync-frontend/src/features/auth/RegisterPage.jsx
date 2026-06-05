import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from './AuthLayout.jsx';
import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import { useAuth } from '../../core/auth/AuthContext.jsx';
import { useToast } from '../../shared/components/Toast.jsx';

/**
 * Step 1 of registration. Collects only role + identity — role-specific
 * profile details are captured on /onboarding (step 2).
 *
 * ROLE_ADMIN is intentionally NOT exposed in this picker. New admins must be
 * invited from the Admin Console by the developer / an existing admin.
 */
const ROLES = [
  { value: 'ROLE_LEARNER', title: 'Learner', subtitle: 'Find mentors and book 1-on-1 sessions.' },
  { value: 'ROLE_MENTOR',  title: 'Mentor',  subtitle: 'Share your skills, build a reputation.' }
];

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_LEARNER'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Please enter your full name';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Invalid email';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role
      });
      toast.success('Account created. Let\'s set up your profile.');
      navigate('/onboarding', { replace: true });
    } catch (err) {
      toast.error(err.userMessage || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Step 1 of 2"
      title="Create your account"
      subtitle="Pick whether you'll learn or teach. We'll grab the details on the next screen."
    >
      <form onSubmit={onSubmit} className="col" style={{ gap: 14 }} noValidate>
        {/* Role picker */}
        <div className="field">
          <label className="field-label">I&apos;m signing up as</label>
          <div className="row wrap" style={{ gap: 8 }}>
            {ROLES.map((r) => {
              const active = form.role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                  className="card"
                  style={{
                    flex: 1,
                    padding: 14,
                    textAlign: 'left',
                    borderColor: active ? 'var(--brand-600)' : 'var(--glass-border)',
                    background: active ? 'var(--brand-50)' : 'var(--bg-raised)',
                    boxShadow: active ? '0 0 0 3px rgba(0,122,100,0.15)' : undefined,
                    cursor: 'pointer'
                  }}
                  aria-pressed={active}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.subtitle}</div>
                </button>
              );
            })}
          </div>
          <span className="field-hint">
            Looking for an admin account? Admins are invited by the developer — please ask.
          </span>
        </div>

        <Input label="Full name" name="fullName" autoComplete="name"
               placeholder="Ada Lovelace"
               value={form.fullName} onChange={update('fullName')} error={errors.fullName} />
        <Input label="Email" name="email" type="email" autoComplete="email"
               placeholder="you@example.com"
               value={form.email} onChange={update('email')} error={errors.email} />
        <Input label="Password" name="password" type="password" autoComplete="new-password"
               placeholder="At least 8 characters"
               value={form.password} onChange={update('password')} error={errors.password}
               hint="Use a mix of upper/lowercase, numbers and symbols." />
        <Input label="Confirm password" name="confirmPassword" type="password"
               autoComplete="new-password"
               placeholder="Re-enter your password"
               value={form.confirmPassword} onChange={update('confirmPassword')}
               error={errors.confirmPassword} />

        <Button type="submit" block loading={submitting}>Continue →</Button>

        <div className="row center" style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
          Already have an account?&nbsp;<Link to="/auth/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
