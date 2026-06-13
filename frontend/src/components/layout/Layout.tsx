import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';

const navItems = [
  { icon: '🏠', label: 'Home', path: '/' },
  { icon: '🔥', label: 'Trending', path: '/trending' },
  { icon: '👹', label: 'Monsters', path: '/monsters' },
  { icon: '🏆', label: 'Rankings', path: '/rankings' },
  { icon: '🛒', label: 'Marketplace', path: '/marketplace' },
  { icon: '💬', label: 'Messages', path: '/messages', badge: 12 },
  { icon: '📅', label: 'Events', path: '/events' },
  { icon: '📊', label: 'Analytics', path: '/analytics' },
  { icon: '⚙️', label: 'Settings', path: '/settings' },
];

interface LayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function Layout({ children, rightSidebar }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── TOPNAV ── */}
      <nav style={{
        height: 60, flexShrink: 0,
        background: 'var(--sidebar)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 16, zIndex: 100,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 210, flexShrink: 0, textDecoration: 'none' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg,#2A0820,#1A0535)',
            border: '1px solid var(--pinkborder)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: 'var(--glow-sm)',
          }}>😈</div>
          <div style={{ lineHeight: 1.15 }}>
            <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '.05em' }}>POPULAR</span>
            <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: 'var(--pink)', letterSpacing: '.05em', textShadow: '0 0 15px rgba(255,20,147,.5)' }}>MONSTERS</span>
          </div>
        </Link>

        {/* Search */}
        <div style={{
          flex: 1, maxWidth: 500, height: 38,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 100, display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 9,
        }}>
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>🔍</span>
          <input
            placeholder="Search for monsters, posts, hashtags..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', color: '#fff', fontSize: 13,
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              height: 36, padding: '0 18px', borderRadius: 100,
              background: 'var(--pink)', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
              boxShadow: '0 4px 20px rgba(255,20,147,.35)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ✏️ Create Post
          </button>

          <div style={{ position: 'relative' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,.06)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16,
            }}>🔔</div>
            <span style={{
              position: 'absolute', top: -3, right: -3,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--pink)', color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 8px var(--pink)',
            }}>8</span>
          </div>

          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,.06)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16,
          }}>💬</div>

          <div
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 36, padding: '0 12px 0 4px', borderRadius: 100,
              background: 'rgba(255,255,255,.06)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <Avatar name={user?.username} size="sm" showOnline />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.username}</span>
            <span style={{ fontSize: 11, color: 'var(--sub)' }}>▾</span>
          </div>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{
        flex: 1, overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '220px 1fr 310px',
      }}>

        {/* LEFT SIDEBAR */}
        <aside style={{
          background: 'var(--sidebar)',
          borderRight: '1px solid var(--border)',
          padding: '12px 10px 0',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600,
                  color: isActive ? '#fff' : 'var(--sub)',
                  background: isActive ? 'rgba(255,20,147,0.12)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: 2,
                  transition: 'all .18s',
                  position: 'relative',
                  borderLeft: isActive ? '3px solid var(--pink)' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: 19 }}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--pink)', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 100,
                    boxShadow: '0 0 8px rgba(255,20,147,.3)',
                  }}>{item.badge}</span>
                )}
              </Link>
            );
          })}

          {/* Castle Art */}
          <div style={{
            marginTop: 'auto', height: 185, flexShrink: 0,
            borderRadius: '12px 12px 0 0', overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(180deg,#06020C 0%,#120530 25%,#280840 45%,#400830 65%,#280528 85%,#100310 100%)',
          }}>
            {/* Moon */}
            <div style={{
              position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
              width: 80, height: 80, borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(255,20,147,.8) 0%,rgba(180,0,80,.4) 40%,transparent 70%)',
              boxShadow: '0 0 60px rgba(255,20,147,.4),0 0 120px rgba(180,0,80,.15)',
            }} />
            <div style={{ position: 'absolute', top: 55, left: 0, right: 0, textAlign: 'center', fontSize: 11, opacity: .35, letterSpacing: 10 }}>🦇 🦇 🦇</div>
            {/* Castle SVG */}
            <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 160 }} viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg">
              <polygon points="20,160 30,118 40,160" fill="#0A0215"/>
              <polygon points="8,160 22,122 36,160" fill="#080112"/>
              <polygon points="180,160 192,120 204,160" fill="#0A0215"/>
              <polygon points="195,160 208,125 220,160" fill="#080112"/>
              <rect x="75" y="95" width="70" height="70" fill="#0E0220"/>
              <rect x="90" y="68" width="40" height="35" fill="#120330"/>
              <rect x="58" y="82" width="28" height="80" fill="#0C0118"/>
              <rect x="134" y="82" width="28" height="80" fill="#0C0118"/>
              <polygon points="58,82 72,58 86,82" fill="#16043A"/>
              <polygon points="134,82 148,58 162,82" fill="#16043A"/>
              <polygon points="90,68 110,42 130,68" fill="#1C0545"/>
              <rect x="105" y="78" width="10" height="14" rx="5" fill="rgba(255,20,147,.25)"/>
              <rect x="64" y="96" width="8" height="11" rx="4" fill="rgba(255,20,147,.12)"/>
              <rect x="148" y="96" width="8" height="11" rx="4" fill="rgba(255,20,147,.12)"/>
              <rect x="103" y="130" width="14" height="20" rx="7 7 0 0" fill="#04000A"/>
              <ellipse cx="110" cy="158" rx="55" ry="6" fill="rgba(255,20,147,.06)"/>
            </svg>
          </div>
        </aside>

        {/* CENTER */}
        <main style={{ overflowY: 'auto', background: 'var(--bg)' }}>
          {children}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside style={{
          background: 'var(--sidebar)',
          borderLeft: '1px solid var(--border)',
          padding: '18px 14px',
          overflowY: 'auto',
        }}>
          {rightSidebar}
        </aside>
      </div>
    </div>
  );
}