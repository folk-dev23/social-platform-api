import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(122,28,172,0.12) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg,#2A0820,#1A0535)',
            border: '1px solid rgba(255,20,147,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 14px',
            boxShadow: '0 0 20px rgba(255,20,147,0.3)',
          }}>😈</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '.04em' }}>
            <span style={{ color: '#fff' }}>POPULAR </span>
            <span style={{ color: 'var(--pink)', textShadow: '0 0 15px rgba(255,20,147,.5)' }}>MONSTERS</span>
          </div>
          <div style={{ color: 'var(--sub)', fontSize: 13, marginTop: 6 }}>
            Join the dark realm
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top glow line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg,transparent,var(--pink),transparent)',
            opacity: .5,
          }} />

          {error && (
            <div style={{
              background: 'rgba(255,0,85,.08)',
              border: '1px solid rgba(255,0,85,.2)',
              color: '#FF5577', borderRadius: 8,
              padding: '10px 14px', marginBottom: 18,
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--sub)', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 14px',
                  color: '#fff', fontSize: 14,
                  fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,20,147,.4)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--sub)', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 14px',
                  color: '#fff', fontSize: 14,
                  fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,20,147,.4)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--sub)', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 14px',
                  color: '#fff', fontSize: 14,
                  fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255,20,147,.4)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', height: 42, borderRadius: 8,
                background: 'var(--pink)', color: '#fff',
                fontSize: 14, fontWeight: 700, border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? .7 : 1,
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 20px rgba(255,20,147,.35)',
                transition: 'all .2s',
              }}
            >
              {isLoading ? 'Creating account...' : '⚡ Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--sub)', fontSize: 13, marginTop: 18 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--hotpink)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(155,138,174,.35)', fontSize: 11, marginTop: 16, letterSpacing: '.08em' }}>
          — BE SEEN. BE HEARD. BE WORSHIPPED. —
        </p>
      </div>
    </div>
  );
}