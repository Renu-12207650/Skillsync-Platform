/**
 * Nikki's FAQ corpus.
 * Each entry has: question, answer, and a list of keywords used for fuzzy matching
 * against the user's input. Keep keywords lowercase and singular where possible.
 */
export const FAQS = [
  {
    id: 'getting-started',
    question: 'How do I get started on SkillSync?',
    answer:
      'Sign up, pick whether you want to learn or mentor, and you\'ll land on the dashboard. ' +
      'From there, "Find mentors" lets learners browse the catalog, and "Sessions" tracks your bookings.',
    keywords: ['start', 'begin', 'get started', 'how to use', 'new', 'first time', 'onboard']
  },
  {
    id: 'find-mentor',
    question: 'How do I find a mentor?',
    answer:
      'Click "Find mentors" in the sidebar, filter by skill or experience, and open any profile to ' +
      'see availability. Use "Book session" to request a time. Approved mentors will accept or propose a new slot.',
    keywords: ['mentor', 'find mentor', 'browse', 'search mentor', 'choose mentor']
  },
  {
    id: 'become-mentor',
    question: 'How do I become a mentor?',
    answer:
      'Open the "Become a mentor" card in the sidebar (or visit /mentors/apply) and submit your bio, ' +
      'years of experience, and the skills you teach. An admin reviews each application before you go live.',
    keywords: ['become mentor', 'apply', 'mentor apply', 'teach', 'i want to mentor']
  },
  {
    id: 'sessions',
    question: 'Where are my sessions?',
    answer:
      'Open "Sessions" from the sidebar to see all upcoming and past bookings. Each row has the mentor, ' +
      'skill, scheduled time, and a button to join, reschedule, or cancel.',
    keywords: ['session', 'booking', 'meetings', 'my sessions', 'where session']
  },
  {
    id: 'cancel-session',
    question: 'Can I cancel or reschedule a session?',
    answer:
      'Yes. Go to "Sessions", click the relevant row, and pick "Cancel" or "Reschedule". Both sides ' +
      'get a notification. Free cancellation up to 12 hours before the session.',
    keywords: ['cancel', 'reschedule', 'change session', 'move session']
  },
  {
    id: 'profile',
    question: 'How do I update my profile?',
    answer:
      'Click "Profile" in the sidebar. You can change your full name, bio, profile image, LinkedIn, ' +
      'and GitHub. Save changes when done — the rest of the app updates instantly.',
    keywords: ['profile', 'edit profile', 'update profile', 'bio', 'linkedin']
  },
  {
    id: 'password',
    question: 'I forgot my password.',
    answer:
      'On the sign-in page, click "Forgot password?". Enter your email, we generate a reset token ' +
      '(shown on screen for the demo). Open the reset link, set a new password, and sign in again.',
    keywords: ['password', 'forgot', 'reset password', 'lost password']
  },
  {
    id: 'notifications',
    question: 'Where are my notifications?',
    answer:
      'Open "Notifications" in the sidebar. Anything important — session approvals, reminders, ' +
      'mentor decisions — lands there. Unread items show a badge on the icon.',
    keywords: ['notification', 'alerts', 'reminders', 'unread']
  },
  {
    id: 'roles',
    question: 'What roles exist on SkillSync?',
    answer:
      'Three roles: Learner (find mentors, book sessions), Mentor (publish a profile, accept bookings), ' +
      'and Admin (approve mentors, manage the skill catalog and users).',
    keywords: ['role', 'admin', 'learner', 'mentor role', 'permissions']
  },
  {
    id: 'skills',
    question: 'How is the skill catalog managed?',
    answer:
      'Admins curate the catalog from Admin Console → Skill catalog. Learners pick interests during ' +
      'signup; mentors pick what they teach when applying. Skills drive the matching algorithm.',
    keywords: ['skill', 'catalog', 'add skill', 'skills list', 'manage skills']
  },
  {
    id: 'pricing',
    question: 'Is SkillSync free?',
    answer:
      'The platform itself is free for learners and mentors. Mentors set their own session rates; ' +
      'SkillSync takes a small platform fee that\'s shown before booking. There are no hidden charges.',
    keywords: ['pricing', 'cost', 'free', 'fee', 'charge', 'paid']
  },
  {
    id: 'contact',
    question: 'How do I contact the admins / support team?',
    answer:
      'Use the "Message admins" button below 👇 — it opens a form that goes straight to the support inbox. ' +
      'You can also describe the issue and we\'ll route it to the right team.',
    keywords: ['contact', 'help', 'support', 'admin contact', 'reach', 'team', 'report issue', 'bug']
  }
];

const STOPWORDS = new Set([
  'the','a','an','to','for','and','or','of','is','it','i','you','my','me','do','can',
  'how','what','where','when','why','where','will','this','that'
]);

/**
 * Fuzzy-match the user's question against the FAQ corpus.
 * Returns the top 3 candidates by score (descending). Empty array if no match.
 */
export function matchFaqs(query) {
  const q = (query || '').toLowerCase();
  if (q.trim().length < 2) return [];

  const tokens = q.split(/\W+/).filter((t) => t && !STOPWORDS.has(t));

  const scored = FAQS.map((faq) => {
    let score = 0;
    for (const kw of faq.keywords) {
      if (q.includes(kw)) score += 4;
    }
    for (const t of tokens) {
      if (faq.question.toLowerCase().includes(t)) score += 1;
      if (faq.keywords.some((k) => k.includes(t))) score += 0.5;
    }
    return { faq, score };
  })
  .filter((s) => s.score > 0)
  .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.faq);
}
