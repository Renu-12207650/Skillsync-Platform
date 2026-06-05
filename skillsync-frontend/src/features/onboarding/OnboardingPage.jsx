import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../core/auth/AuthContext.jsx';
import userService from '../../core/services/userService.js';
import skillService from '../../core/services/skillService.js';
import mentorService from '../../core/services/mentorService.js';
import { useToast } from '../../shared/components/Toast.jsx';

import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import Logo from '../../shared/components/Logo.jsx';

/**
 * Step 2 of registration. Forces the user to fill in role-specific profile
 * details before they land on the dashboard.
 *
 * Skipped automatically if a profile + role-specific record already exists.
 */
export default function OnboardingPage() {
  const { user, updateProfileLocal, setSkillInterests } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedin] = useState('');
  const [githubUrl, setGithub] = useState('');
  const [profileImageUrl, setImageUrl] = useState('');
  const [pickedSkills, setPickedSkills] = useState([]);
  const [yearsExp, setYearsExp] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [languages, setLanguages] = useState('English');

  const isMentor  = user?.role === 'ROLE_MENTOR';
  const isLearner = user?.role === 'ROLE_LEARNER';
  const isAdmin   = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function bootstrap() {
      try {
        const list = await skillService.list().catch(() => []);
        if (!active) return;
        setSkills(list || []);
        // If a profile already exists, prefill it. We treat onboarding as
        // "complete" if there's a saved bio + (mentor) approved/pending mentor record.
        if (user.profile?.bio && user.profile.bio.length > 4) {
          setBio(user.profile.bio);
          setLinkedin(user.profile.linkedinUrl || '');
          setGithub(user.profile.githubUrl || '');
          setImageUrl(user.profile.profileImageUrl || '');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => { active = false; };
  }, [user]);

  function toggleSkill(id) {
    setPickedSkills((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]
    );
  }

  function validate() {
    if (!bio.trim() || bio.trim().length < 10) {
      toast.error('Tell us a little about yourself (at least 10 characters).');
      return false;
    }
    if (isMentor) {
      if (pickedSkills.length === 0) { toast.error('Pick at least one skill you can teach.'); return false; }
      if (!yearsExp || Number(yearsExp) < 0) { toast.error('Add your years of experience.'); return false; }
    }
    if (isLearner && pickedSkills.length === 0) {
      toast.error('Pick at least one skill you want to learn.'); return false;
    }
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Always save / update the user profile.
      const profilePayload = {
        fullName: user.fullName,
        bio: bio.trim(),
        linkedinUrl: linkedinUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        profileImageUrl: profileImageUrl.trim() || null
      };
      let savedProfile;
      if (user.profile) {
        savedProfile = await userService.updateProfile(profilePayload);
      } else {
        try { savedProfile = await userService.createProfile(profilePayload); }
        catch { savedProfile = await userService.updateProfile(profilePayload); }
      }
      updateProfileLocal(savedProfile);

      if (isMentor) {
        // Submit the mentor application.
        await mentorService.apply({
          bio: bio.trim(),
          yearsOfExperience: Number(yearsExp),
          hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
          skillIds: pickedSkills,
          languages: languages.split(',').map((s) => s.trim()).filter(Boolean)
        });
        toast.success('Profile saved. Your mentor application is pending admin approval.');
      } else if (isLearner) {
        setSkillInterests(pickedSkills);
        toast.success('Profile saved. Welcome to SkillSync!');
      } else {
        toast.success('Profile saved.');
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.userMessage || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  const filteredSkills = useMemo(() => skills.slice(0, 24), [skills]);

  if (!user) return null;
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '40px 24px',
      display: 'grid', placeItems: 'center',
      background: 'var(--bg-base)'
    }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div className="row" style={{ alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <Logo size={32} />
          <span className="badge">Step 2 of 2 — complete your profile</span>
        </div>

        <div className="card" style={{ padding: 36, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1.5px solid var(--glass-border)' }}>
          <div className="col" style={{ gap: 6, marginBottom: 20 }}>
            <span className="page-eyebrow">
              {isMentor && 'Mentor profile'}
              {isLearner && 'Learner profile'}
              {isAdmin && 'Admin profile'}
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {isMentor && 'Tell learners what you can teach.'}
              {isLearner && 'Tell us what you want to learn.'}
              {isAdmin && 'Set up your admin profile.'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              You can change all of this later from the Profile page.
            </p>
          </div>

          <form onSubmit={onSubmit} className="col" style={{ gap: 16 }} noValidate>
            <Input
              label="Short bio"
              as="textarea"
              rows={3}
              placeholder={isMentor
                ? 'I teach React and System Design. I\'ve shipped at scale at...'
                : 'I\'m diving into backend engineering. Hoping to learn about...'}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              hint="Visible on your public profile. Max 500 characters."
            />

            {/* Skills */}
            {(isMentor || isLearner) && (
              <div className="field">
                <label className="field-label">
                  {isMentor ? 'Skills you can teach' : 'Skills you want to learn'}
                </label>
                {filteredSkills.length === 0 ? (
                  <p className="field-hint">
                    The skill catalog is empty. Ask an admin to seed it (or run seed-skills.ps1).
                  </p>
                ) : (
                  <div className="row wrap" style={{ gap: 6 }}>
                    {filteredSkills.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className={`chip ${pickedSkills.includes(s.id) ? 'is-active' : ''}`}
                        onClick={() => toggleSkill(s.id)}
                        aria-pressed={pickedSkills.includes(s.id)}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mentor-only: experience + hourly rate */}
            {isMentor && (
              <div className="row wrap" style={{ gap: 12 }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <Input
                    label="Years of experience"
                    type="number"
                    min={0}
                    placeholder="5"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <Input
                    label="Hourly rate (USD, optional)"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    hint="Leave 0 for free."
                  />
                </div>
              </div>
            )}

            <Input
              label="Languages you speak"
              placeholder="English, Hindi"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              hint="Comma-separated."
            />

            <div className="row wrap" style={{ gap: 12 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Input label="LinkedIn (optional)" placeholder="https://linkedin.com/in/…"
                       value={linkedinUrl} onChange={(e) => setLinkedin(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Input label="GitHub (optional)" placeholder="https://github.com/…"
                       value={githubUrl} onChange={(e) => setGithub(e.target.value)} />
              </div>
            </div>

            <Input label="Profile image URL (optional)"
                   placeholder="https://…/photo.jpg"
                   value={profileImageUrl}
                   onChange={(e) => setImageUrl(e.target.value)} />

            <Button type="submit" loading={saving} block>
              {isMentor ? 'Submit mentor profile' : 'Save and continue'}
            </Button>
          </form>
        </div>

        <style>{`
          /* Mobile responsive adjustments */
          @media (max-width: 767px) {
            /* Stack form rows */
            form .row.wrap {
              flex-direction: column !important;
            }
            form .row.wrap > div {
              flex: none !important;
              width: 100% !important;
              min-width: auto !important;
            }
            /* Smaller card padding */
            .card {
              padding: 24px 20px !important;
            }
            h2 {
              font-size: 24px !important;
            }
          }
          /* Small phones */
          @media (max-width: 359px) {
            .card {
              padding: 20px 16px !important;
            }
            h2 {
              font-size: 22px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
