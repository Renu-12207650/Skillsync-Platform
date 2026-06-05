import { useEffect, useState } from 'react';

import userService from '../../core/services/userService.js';
import skillService from '../../core/services/skillService.js';
import { useAuth } from '../../core/auth/AuthContext.jsx';
import { useToast } from '../../shared/components/Toast.jsx';

import Card from '../../shared/components/Card.jsx';
import Avatar from '../../shared/components/Avatar.jsx';
import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import Spinner from '../../shared/components/Spinner.jsx';

export default function ProfilePage() {
  const { user, updateProfileLocal, setSkillInterests, isLearner } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(user?.profile || null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(!user?.profile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', bio: '', linkedinUrl: '', githubUrl: '' });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [me, allSkills] = await Promise.all([
          userService.getMyProfile().catch(() => null),
          skillService.list().catch(() => [])
        ]);
        if (!active) return;
        if (me) {
          setProfile(me);
          updateProfileLocal(me);
        }
        setSkills(allSkills);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || user?.fullName || '',
        bio: profile.bio || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || ''
      });
    } else if (user) {
      setForm({ fullName: user.fullName, bio: '', linkedinUrl: '', githubUrl: '' });
    }
  }, [profile, user]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function save() {
    setSaving(true);
    try {
      const saved = await userService.updateProfile({
        fullName: form.fullName.trim(),
        bio: form.bio,
        linkedinUrl: form.linkedinUrl,
        githubUrl: form.githubUrl,
        profileImageUrl: profile?.profileImageUrl || null
      });
      setProfile(saved);
      updateProfileLocal(saved);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.userMessage || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  function toggleInterest(id) {
    const interests = user?.skillInterests || [];
    const next = interests.includes(id) ? interests.filter((x) => x !== id) : [...interests, id];
    setSkillInterests(next);
  }

  if (loading) return <div className="page"><Spinner size={36} label="Loading profile…" /></div>;

  const interests = user?.skillInterests || [];

  return (
    <div className="page" style={{ maxWidth: 880 }}>
      <header className="page-header">
        <span className="page-eyebrow">Account</span>
        <h1 className="page-title">My profile</h1>
        <p className="page-subtitle">Update your public details and (if you&apos;re a learner) your skill interests.</p>
      </header>

      <Card>
        <div className="row" style={{ gap: 18, alignItems: 'center', marginBottom: 18 }}>
          <Avatar size="lg" name={form.fullName || user?.fullName} src={profile?.profileImageUrl} />
          <div>
            <h3>{user?.fullName}</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user?.email}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
              {user?.role?.replace('ROLE_', '').toLowerCase()}
            </div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Full name"   value={form.fullName} onChange={update('fullName')} />
          <Input label="Profile image URL"
                 value={profile?.profileImageUrl || ''}
                 onChange={(e) => setProfile((p) => ({ ...(p || {}), profileImageUrl: e.target.value }))}
                 placeholder="https://…" />
        </div>
        <div style={{ marginTop: 12 }}>
          <Input label="Bio" as="textarea" rows={4}
                 value={form.bio} onChange={update('bio')}
                 placeholder="A few sentences about yourself."
                 hint="Visible on your public profile (max 500 characters)." />
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <Input label="LinkedIn"
                 value={form.linkedinUrl} onChange={update('linkedinUrl')}
                 placeholder="https://linkedin.com/in/…" />
          <Input label="GitHub"
                 value={form.githubUrl} onChange={update('githubUrl')}
                 placeholder="https://github.com/…" />
        </div>

        <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
          <Button onClick={save} loading={saving}>Save changes</Button>
        </div>
      </Card>

      {isLearner && (
        <Card>
          <div style={{ marginBottom: 12 }}>
            <h3>Learning interests</h3>
            <p className="card-subtitle">
              These are stored locally and used to personalise your mentor recommendations.
            </p>
          </div>
          {skills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>The skill catalog is empty.</p>
          ) : (
            <div className="row wrap" style={{ gap: 6 }}>
              {skills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip ${interests.includes(s.id) ? 'is-active' : ''}`}
                  onClick={() => toggleInterest(s.id)}
                  aria-pressed={interests.includes(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
