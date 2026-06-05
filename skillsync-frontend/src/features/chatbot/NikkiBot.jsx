import { useEffect, useMemo, useRef, useState } from 'react';

import { useToast } from '../../shared/components/Toast.jsx';
import supportService from '../../core/services/supportService.js';
import { FAQS, matchFaqs } from './faqs.js';

/**
 * Nikki — the in-app helper bot.
 * Answers FAQs about SkillSync and lets users send a message to the admin team.
 * State is local; conversation does not persist across reloads.
 */
export default function NikkiBot() {
  const toast = useToast();
  const [messages, setMessages] = useState(() => [
    {
      from: 'nikki',
      text:
        "Hi, I'm Nikki 👋 — your SkillSync helper. Ask me how things work " +
        "(\"how do I find a mentor?\", \"how do I become a mentor?\"). " +
        "I can also forward a message to the admin team if you tap \"Message admins\" below."
    }
  ]);
  const [input, setInput] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactBody, setContactBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const scroller = useRef(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, showContact]);

  const suggestions = useMemo(
    () => FAQS.slice(0, 4).map((f) => f.question),
    []
  );

  function handleAsk(e) {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMessages((curr) => [...curr, { from: 'me', text: q }]);

    const matches = matchFaqs(q);
    setTimeout(() => {
      if (matches.length === 0) {
        setMessages((curr) => [
          ...curr,
          {
            from: 'nikki',
            text:
              "I couldn't match that to anything I know about SkillSync. Try one of the suggestions below, " +
              "or tap \"Message admins\" to send your question to the team."
          }
        ]);
      } else {
        const top = matches[0];
        setMessages((curr) => [
          ...curr,
          { from: 'nikki', text: top.answer },
          ...(matches.length > 1
            ? [{ from: 'nikki-related', text: matches.slice(1).map((m) => m.question) }]
            : [])
        ]);
      }
    }, 250);
  }

  async function submitContact(e) {
    e.preventDefault();
    if (contactSubject.trim().length < 3 || contactBody.trim().length < 5) {
      toast.error('Please fill in a subject and a longer message.');
      return;
    }
    setSubmitting(true);
    try {
      await supportService.submit({
        subject: contactSubject.trim(),
        message: contactBody.trim()
      });
      toast.success('Message sent to the admin team.');
      setMessages((curr) => [
        ...curr,
        { from: 'me', text: `[sent to admins] ${contactSubject.trim()}` },
        {
          from: 'nikki',
          text:
            "Thanks — your message is in the queue. An admin will follow up via your registered email. " +
            "You can keep using the app in the meantime."
        }
      ]);
      setShowContact(false);
      setContactSubject('');
      setContactBody('');
    } catch (err) {
      toast.error(err.userMessage || 'Could not send your message right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="col" style={{ height: '100%' }}>
      <div
        ref={scroller}
        className="col"
        style={{
          flex: 1,
          gap: 10,
          padding: 14,
          overflowY: 'auto',
          fontSize: 14
        }}
      >
        {messages.map((m, i) => {
          if (m.from === 'me') {
            return <Bubble key={i} side="right" text={m.text} />;
          }
          if (m.from === 'nikki-related') {
            return (
              <div key={i} className="col" style={{ gap: 6, marginLeft: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Related questions:</span>
                <div className="row wrap" style={{ gap: 6 }}>
                  {m.text.map((q, j) => (
                    <button
                      key={j}
                      type="button"
                      className="chip"
                      onClick={() => { setInput(q); }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          return <Bubble key={i} side="left" text={m.text} />;
        })}

        {messages.length === 1 && (
          <div className="col" style={{ gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try one of these:</span>
            <div className="row wrap" style={{ gap: 6 }}>
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chip"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showContact ? (
        <form
          onSubmit={submitContact}
          className="col"
          style={{ gap: 8, padding: 12, borderTop: '1.5px solid var(--glass-border)', background: 'var(--bg-raised)' }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Message the admin team</span>
          <input
            className="input"
            placeholder="Subject"
            value={contactSubject}
            onChange={(e) => setContactSubject(e.target.value)}
            maxLength={200}
            autoFocus
          />
          <textarea
            className="input"
            placeholder="Describe your issue or question…"
            rows={3}
            value={contactBody}
            onChange={(e) => setContactBody(e.target.value)}
            maxLength={2000}
          />
          <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowContact(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleAsk}
          className="row"
          style={{ gap: 6, padding: 10, borderTop: '1.5px solid var(--glass-border)', background: 'var(--bg-raised)' }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowContact(true)}
            title="Send a message to the admin team"
          >
            ✉ Admins
          </button>
          <input
            className="input"
            placeholder="Ask Nikki anything about SkillSync…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!input.trim()}>
            Ask
          </button>
        </form>
      )}
    </div>
  );
}

function Bubble({ side, text }) {
  const isMe = side === 'right';
  return (
    <div
      style={{
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        background: isMe ? 'var(--brand-600)' : 'var(--brand-50)',
        color: isMe ? '#FFFFFF' : 'var(--text-primary)',
        border: isMe ? '1px solid var(--brand-600)' : '1px solid var(--brand-100)',
        padding: '8px 12px',
        borderRadius: 12,
        maxWidth: '80%',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.45
      }}
    >
      {text}
    </div>
  );
}
