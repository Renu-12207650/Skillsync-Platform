import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import ChatbotWidget from '../features/chatbot/ChatbotWidget.jsx';

/**
 * Authenticated app shell — sidebar + topbar + scrollable content area.
 */
export default function Shell() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg-base)'
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-base)' }}>
        <Topbar />
        <main style={{ flex: 1, overflowX: 'hidden' }} className="fade-in">
          <Outlet />
        </main>
      </div>

      <ChatbotWidget />
      <MobileBottomNav />

      <style>{`
        /* Mobile: add bottom padding for bottom nav */
        @media (max-width: 767px) {
          main { padding-bottom: 80px; }
        }
        /* Dark mode shell bg */
        [data-theme='dark'] > div { background: #0F0A1E !important; }
      `}</style>
    </div>
  );
}
