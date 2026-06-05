import { useEffect, useMemo, useState } from 'react';

import mentorService from '../../core/services/mentorService.js';
import skillService from '../../core/services/skillService.js';
import userService from '../../core/services/userService.js';
import supportService from '../../core/services/supportService.js';
import authService from '../../core/services/authService.js';
import { useToast } from '../../shared/components/Toast.jsx';

import Card from '../../shared/components/Card.jsx';
import Button from '../../shared/components/Button.jsx';
import Input from '../../shared/components/Input.jsx';
import Badge from '../../shared/components/Badge.jsx';
import EmptyState from '../../shared/components/EmptyState.jsx';
import Spinner from '../../shared/components/Spinner.jsx';
import Avatar from '../../shared/components/Avatar.jsx';

const TABS = [
  { key: 'overview',   label: 'Overview' },
  { key: 'mentors',    label: 'Mentor approvals' },
  { key: 'users',      label: 'Users' },
  { key: 'skills',     label: 'Skill catalog' },
  { key: 'support',    label: 'Support inbox' },
  { key: 'invite',     label: 'Invite user' }
];

export default function AdminConsole() {
  const toast = useToast();
  const [tab, setTab] = useState('overview');

  const [pending, setPending] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const [isDeveloper, setIsDeveloper] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: '', email: '', password: '', role: 'ROLE_LEARNER'
  });
  const [inviting, setInviting] = useState(false);

  // Skill form
  const [skillForm, setSkillForm] = useState({ name: '', category: '', description: '' });
  const [savingSkill, setSavingSkill] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [pendingPage, mentorsPage, userList, skillList, supportList, devFlag] = await Promise.all([
          mentorService.pending({ size: 100 }).catch(() => ({ content: [] })),
          mentorService.search({ size: 200 }).catch(() => ({ content: [] })),
          authService.adminListUsers().catch((err) => { toast.error('Could not load users: ' + (err.userMessage || err.message)); return []; }),
          skillService.list().catch(() => []),
          supportService.listAll().catch(() => []),
          authService.isDeveloper().catch(() => false)
        ]);
        if (active) setIsDeveloper(!!devFlag);
        if (!active) return;
        const pendingList = pendingPage.content || [];
        const mentorList  = mentorsPage.content || [];
        setPending(pendingList);
        setAllMentors(mentorList);
        setUsers(userList);
        setSkills(skillList);
        setSupportMessages(supportList);

        // Hydrate user profiles for mentor cards.
        const ids = [...pendingList, ...mentorList].map((m) => m.authUserId).filter(Boolean);
        const lookup = Object.fromEntries((userList || []).map((u) => [u.userId, u]));
        await Promise.all(ids.map(async (id) => {
          if (!lookup[id]) {
            try { lookup[id] = await userService.getProfile(id); } catch { /* ignore */ }
          }
        }));
        if (active) setProfilesById(lookup);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => ({
    users: users.length,
    mentors: allMentors.filter((m) => m.status === 'ACTIVE').length,
    pending: pending.length,
    skills: skills.length,
    openTickets: supportMessages.filter((m) => m.status === 'OPEN').length
  }), [users, allMentors, pending, skills, supportMessages]);

  async function resolveSupport(id) {
    setResolvingId(id);
    try {
      const updated = await supportService.resolve(id);
      setSupportMessages((curr) => curr.map((m) => (m.id === id ? updated : m)));
      toast.success('Marked as resolved');
    } catch (err) {
      toast.error(err.userMessage || 'Could not update the message');
    } finally {
      setResolvingId(null);
    }
  }

  async function deleteUser(authUserId, fullName) {
    if (!window.confirm(`Permanently delete ${fullName}? This cannot be undone.`)) return;
    try {
      await authService.adminDeleteUser(authUserId);
      setUsers((curr) => curr.map((u) => (u.userId === authUserId ? { ...u, enabled: false } : u)));
      toast.success(`${fullName} has been deleted.`);
    } catch (err) {
      toast.error(err.userMessage || 'Could not delete user.');
    }
  }

  async function submitInvite(e) {
    e.preventDefault();
    if (inviteForm.fullName.trim().length < 2) { toast.error('Full name is required'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inviteForm.email)) { toast.error('Invalid email'); return; }
    if (inviteForm.password.length < 8)        { toast.error('Password must be at least 8 chars'); return; }
    if (inviteForm.role === 'ROLE_ADMIN' && !isDeveloper) {
      toast.error('Only the developer account can create admin users.');
      return;
    }
    setInviting(true);
    try {
      const created = await authService.adminCreateUser({
        fullName: inviteForm.fullName.trim(),
        email: inviteForm.email.trim().toLowerCase(),
        password: inviteForm.password,
        role: inviteForm.role
      });
      toast.success(`User ${created.email} created with role ${created.role}. Share the password securely.`);
      setInviteForm({ fullName: '', email: '', password: '', role: 'ROLE_LEARNER' });
    } catch (err) {
      toast.error(err.userMessage || 'Could not create user');
    } finally {
      setInviting(false);
    }
  }

  async function decide(id, kind) {
    try {
      const action = kind === 'approve' ? mentorService.approve : mentorService.reject;
      const updated = await action(id);
      setPending((curr) => curr.filter((m) => m.id !== id));
      setAllMentors((curr) => {
        const next = curr.filter((m) => m.id !== id);
        return [updated, ...next];
      });
      toast.success(`Mentor ${kind === 'approve' ? 'approved' : 'rejected'}`);
    } catch (err) {
      toast.error(err.userMessage || 'Could not update mentor');
    }
  }

  async function createSkill(e) {
    e.preventDefault();
    if (!skillForm.name.trim() || !skillForm.category.trim()) {
      toast.error('Name and category are required');
      return;
    }
    setSavingSkill(true);
    try {
      const created = await skillService.create({
        name: skillForm.name.trim(),
        category: skillForm.category.trim(),
        description: skillForm.description
      });
      setSkills((curr) => [...curr, created]);
      setSkillForm({ name: '', category: '', description: '' });
      toast.success('Skill added');
    } catch (err) {
      toast.error(err.userMessage || 'Could not create skill');
    } finally {
      setSavingSkill(false);
    }
  }

  async function deleteSkill(id) {
    if (!window.confirm('Remove this skill from the catalog?')) return;
    try {
      await skillService.remove(id);
      setSkills((curr) => curr.filter((s) => s.id !== id));
      toast.success('Skill removed');
    } catch (err) {
      toast.error(err.userMessage || 'Could not remove skill');
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-eyebrow">
          {isDeveloper ? 'Developer · super admin' : 'Admin'}
        </span>
        <h1 className="page-title">Admin console</h1>
        <p className="page-subtitle">
          Review applications, manage users and the skill catalog.
          {isDeveloper && ' You\'re the developer — you can also create new admins.'}
        </p>
      </header>

      <div className="row" style={{ gap: 6 }}>
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            className={`chip ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
          >
            {t.label}
            {t.key === 'mentors' && stats.pending > 0 && (
              <span style={{ marginLeft: 6, color: 'var(--warning)', fontWeight: 700 }}>· {stats.pending}</span>
            )}
            {t.key === 'support' && stats.openTickets > 0 && (
              <span style={{ marginLeft: 6, color: 'var(--warning)', fontWeight: 700 }}>· {stats.openTickets}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner size={36} label="Loading admin data…" />
      ) : (
        <>
          {tab === 'overview' && (
            <section className="grid grid-4">
              <Stat label="Total users" value={stats.users} />
              <Stat label="Active mentors" value={stats.mentors} />
              <Stat label="Pending applications" value={stats.pending} tone="warning" />
              <Stat label="Skills in catalog" value={stats.skills} />
              <Stat label="Open support tickets" value={stats.openTickets} tone={stats.openTickets > 0 ? 'warning' : undefined} />
            </section>
          )}

          {tab === 'mentors' && (
            pending.length === 0 ? (
              <EmptyState icon="✓" title="Nothing pending" description="All mentor applications have been reviewed." />
            ) : (
              <div className="col" style={{ gap: 10 }}>
                {pending.map((m) => (
                  <Card key={m.id}>
                    <div className="row" style={{ gap: 14, alignItems: 'center' }}>
                      <Avatar name={profilesById[m.authUserId]?.fullName || `User ${m.authUserId}`} />
                      <div className="col" style={{ gap: 2, flex: 1 }}>
                        <strong>{profilesById[m.authUserId]?.fullName || `Mentor #${m.id}`}</strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                          {m.yearsOfExperience} yrs · {m.skillIds?.length || 0} skills
                        </span>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{m.bio}</p>
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <Button size="sm" onClick={() => decide(m.id, 'approve')}>Approve</Button>
                        <Button size="sm" variant="ghost" onClick={() => decide(m.id, 'reject')}>Reject</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}

          {tab === 'users' && (
            users.length === 0 ? (
              <EmptyState icon="◐" title="No users yet" description="Registered users will appear here." />
            ) : (
              <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      <th style={{ padding: '10px 8px' }}>User</th>
                      <th style={{ padding: '10px 8px' }}>Email</th>
                      <th style={{ padding: '10px 8px' }}>Role</th>
                      <th style={{ padding: '10px 8px' }}>Auth ID</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.userId} style={{ borderTop: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                            <Avatar size="sm" name={u.fullName} />
                            <span style={{ fontWeight: 600, opacity: u.enabled === false ? 0.62 : 1 }}>
                              {u.fullName}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: 13 }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: 12 }}>
                          <Badge tone={u.role === 'ROLE_ADMIN' ? 'warning' : u.role === 'ROLE_MENTOR' ? 'info' : undefined}>
                            {u.role?.replace('ROLE_', '')}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: 12 }}>
                          #{u.userId}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <Badge tone={u.enabled === false ? 'danger' : 'success'}>
                            {u.enabled === false ? 'Inactive' : 'Active'}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <Button size="sm" variant="ghost"
                                  onClick={() => deleteUser(u.userId, u.fullName)}
                                  style={{ color: 'var(--danger)' }}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )
          )}

          {tab === 'invite' && (
            <Card>
              <h3 className="serif" style={{ fontSize: 22, marginBottom: 6 }}>Invite a new user</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 18 }}>
                Set the user&apos;s email + a temporary password — share both with them via secure channel.
                They can log in immediately and reset their password from the &ldquo;Forgot password&rdquo; flow.
                {!isDeveloper && (
                  <>
                    {' '}<strong style={{ color: 'var(--warning)' }}>
                      Only the developer account ({"renudhankhar8559@gmail.com"}) can create new admins.
                    </strong>
                  </>
                )}
              </p>
              <form onSubmit={submitInvite} className="col" style={{ gap: 12, maxWidth: 520 }}>
                <Input label="Full name"
                       value={inviteForm.fullName}
                       onChange={(e) => setInviteForm((f) => ({ ...f, fullName: e.target.value }))} />
                <Input label="Email" type="email"
                       value={inviteForm.email}
                       onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} />
                <Input label="Temporary password" type="text"
                       hint="At least 8 characters. The user can change it after first login."
                       value={inviteForm.password}
                       onChange={(e) => setInviteForm((f) => ({ ...f, password: e.target.value }))} />
                <div className="field">
                  <label className="field-label">Role</label>
                  <div className="row wrap" style={{ gap: 6 }}>
                    {[
                      { v: 'ROLE_LEARNER', l: 'Learner' },
                      { v: 'ROLE_MENTOR',  l: 'Mentor' },
                      { v: 'ROLE_ADMIN',   l: 'Admin (developer only)' }
                    ].map((r) => {
                      const disabled = r.v === 'ROLE_ADMIN' && !isDeveloper;
                      return (
                        <button
                          key={r.v}
                          type="button"
                          className={`chip ${inviteForm.role === r.v ? 'is-active' : ''}`}
                          disabled={disabled}
                          onClick={() => !disabled && setInviteForm((f) => ({ ...f, role: r.v }))}
                          style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          {r.l}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button type="submit" loading={inviting}>Create user</Button>
              </form>
            </Card>
          )}

          {tab === 'support' && (
            supportMessages.length === 0 ? (
              <EmptyState icon="✉" title="No support tickets" description="When users send a message via Nikki, it will appear here." />
            ) : (
              <div className="col" style={{ gap: 10 }}>
                {supportMessages.map((m) => (
                  <Card key={m.id}>
                    <div className="row between" style={{ alignItems: 'flex-start' }}>
                      <div className="col" style={{ gap: 4, flex: 1 }}>
                        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                          <strong>{m.subject}</strong>
                          <Badge tone={m.status === 'OPEN' ? 'warning' : 'success'}>
                            {m.status}
                          </Badge>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {m.userFullName || `User #${m.userId}`}
                          {m.userEmail && m.userEmail !== 'unknown' ? ` · ${m.userEmail}` : ''}
                          {' · '}
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6, whiteSpace: 'pre-wrap' }}>
                          {m.message}
                        </p>
                        {m.resolvedAt && (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                            Resolved {new Date(m.resolvedAt).toLocaleString()}
                            {m.adminNote ? ` — ${m.adminNote}` : ''}
                          </span>
                        )}
                      </div>
                      {m.status === 'OPEN' && (
                        <Button
                          size="sm"
                          loading={resolvingId === m.id}
                          onClick={() => resolveSupport(m.id)}
                        >
                          Mark resolved
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )
          )}

          {tab === 'skills' && (
            <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 18, alignItems: 'start' }}>
              <div className="col" style={{ gap: 8 }}>
                {skills.length === 0 ? (
                  <EmptyState icon="✦" title="Catalog is empty" description="Add the first skill to enable mentor matching." />
                ) : (
                  skills.map((s) => (
                    <Card key={s.id}>
                      <div className="row between">
                        <div className="col" style={{ gap: 2 }}>
                          <strong>{s.name}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.category}</span>
                          {s.description && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                              {s.description}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => deleteSkill(s.id)}>Remove</Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <Card>
                <h3>Add a new skill</h3>
                <form onSubmit={createSkill} className="col" style={{ gap: 12, marginTop: 12 }}>
                  <Input label="Name"
                         value={skillForm.name}
                         onChange={(e) => setSkillForm((f) => ({ ...f, name: e.target.value }))} />
                  <Input label="Category"
                         value={skillForm.category}
                         onChange={(e) => setSkillForm((f) => ({ ...f, category: e.target.value }))}
                         hint="e.g. Backend, Frontend, Data, DevOps" />
                  <Input label="Description"
                         as="textarea" rows={3}
                         value={skillForm.description}
                         onChange={(e) => setSkillForm((f) => ({ ...f, description: e.target.value }))} />
                  <Button type="submit" loading={savingSkill}>Add to catalog</Button>
                </form>
              </Card>
            </div>
          )}
        </>
      )}

      <style>{`
        /* Mobile responsive adjustments */
        @media (max-width: 767px) {
          /* Tab buttons wrap */
          .row[style*="gap: 6"] {
            flex-wrap: wrap !important;
          }
          /* Stats grid → single column */
          .grid.grid-3 {
            grid-template-columns: 1fr !important;
          }
          /* User table → horizontal scroll container */
          table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }
          /* Mentor cards stack */
          .grid.grid-2 {
            grid-template-columns: 1fr !important;
          }
          /* Form stacking */
          form .col[style*="maxWidth: 520"] {
            max-width: 100% !important;
          }
          /* Mentor approval cards */
          .card .row {
            flex-wrap: wrap;
            gap: 12px;
          }
          .card .row .btn {
            flex: 1;
          }
        }

        /* Tablet: 2-column stats */
        @media (min-width: 768px) and (max-width: 1023px) {
          .grid.grid-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === 'warning' ? 'var(--warning)' : 'var(--brand-600)';
  const iconBg = tone === 'warning' ? '#FFFBEB' : 'var(--brand-50)';
  const iconBorder = tone === 'warning' ? '#FDE68A' : 'var(--brand-200)';
  return (
    <Card>
      <div className="row between">
        <div className="col" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em' }}>{label}</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: iconBg, border: `1.5px solid ${iconBorder}`, display: 'grid', placeItems: 'center' }}>
          {tone === 'warning'
            ? <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block', boxShadow: '0 0 0 3px rgba(245,158,11,0.25)' }} />
            : <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--brand-500)', display: 'inline-block', boxShadow: '0 0 0 3px rgba(0,168,128,0.25)' }} />}
        </div>
      </div>
    </Card>
  );
}
