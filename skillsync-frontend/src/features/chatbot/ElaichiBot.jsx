import { useEffect, useRef, useState } from 'react';

import chatbotService from '../../core/services/chatbotService.js';

/**
 * Elaichi — the general-purpose AI bot.
 * Calls /chatbot/ask which proxies to OpenAI on the server (or returns
 * hand-written demo replies if no API key is configured).
 * Conversation history is local to the component (resets on close).
 */
const SUGGESTIONS = [
  'How should I prepare for an SDE interview?',
  'Suggest a 12-week roadmap to learn full-stack development.',
  'How do I pick the right mentor on SkillSync?',
  'Explain CAP theorem in 5 lines.'
];

export default function ElaichiBot() {
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content:
        "Hey, I'm Elaichi ✨ — your AI study buddy. Ask me about interview prep, system design, " +
        "what to learn next, or how to pick a mentor. I won't share private info from any organisation."
    }
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [demoBanner, setDemoBanner] = useState(false);

  const scroller = useRef(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send(textArg) {
    const text = (textArg ?? input).trim();
    if (!text || busy) return;
    setInput('');
    const newHistory = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setBusy(true);

    // Send only the last 8 turns as context to keep payloads small.
    const tail = newHistory
      .slice(-9, -1)            // exclude the just-added user msg (sent separately)
      .filter((m) => m.role && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await chatbotService.ask(text, tail);
      setDemoBanner(!!res.demoMode);
      setMessages((curr) => [...curr, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setMessages((curr) => [
        ...curr,
        {
          role: 'assistant',
          content:
            "I couldn't reach the server. " +
            (err.userMessage ? `(${err.userMessage}) ` : '') +
            "Try again in a moment."
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="col" style={{ height: '100%' }}>
      {demoBanner && (
        <div
          style={{
            background: 'var(--brand-50)',
            color: 'var(--text-secondary)',
            fontSize: 12,
            padding: '6px 12px',
            borderBottom: '1.5px solid var(--brand-200)'
          }}
        >
          Elaichi is in demo mode. Ask an admin to set OPENAI_API_KEY to enable full AI answers.
        </div>
      )}

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
        {messages.map((m, i) => (
          <Bubble key={i} side={m.role === 'user' ? 'right' : 'left'} text={m.content} />
        ))}

        {busy && <Bubble side="left" text="Thinking…" muted />}

        {messages.length === 1 && (
          <div className="col" style={{ gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try one of these:</span>
            <div className="row wrap" style={{ gap: 6 }}>
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chip"
                  onClick={() => send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="row"
        style={{ gap: 6, padding: 10, borderTop: '1.5px solid var(--glass-border)', background: 'var(--bg-raised)' }}
      >
        <input
          className="input"
          placeholder="Ask Elaichi anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !input.trim()}>
          {busy ? '…' : 'Ask'}
        </button>
      </form>
    </div>
  );
}

function Bubble({ side, text, muted }) {
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
        maxWidth: '85%',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.5,
        opacity: muted ? 0.7 : 1
      }}
    >
      {text}
    </div>
  );
}
