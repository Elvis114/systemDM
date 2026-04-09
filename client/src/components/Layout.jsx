import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/',                icon: '🏠', label: 'Dashboard',        roles: ['admin','teacher','student'] },
  { to: '/students',        icon: '🎓', label: 'Students',         roles: ['admin','teacher'] },
  { to: '/teachers',        icon: '👩‍🏫', label: 'Teachers',         roles: ['admin'] },
  { to: '/classes',         icon: '🏫', label: 'Classes',          roles: ['admin','teacher'] },
  { to: '/subjects',        icon: '📚', label: 'Subjects',         roles: ['admin'] },
  { to: '/grades',          icon: '📊', label: 'Grades',           roles: ['admin','teacher','student'] },
  { to: '/attendance',      icon: '📅', label: 'Attendance',       roles: ['admin','teacher','student'] },
  { to: '/fees',            icon: '💰', label: 'Fees',             roles: ['admin'] },
  { to: '/pay-fees',        icon: '💳', label: 'Pay Fees',         roles: ['admin','student'] },
  { to: '/payment-history', icon: '📋', label: 'Payment History',  roles: ['admin','student'] },
  { to: '/payments',        icon: '🧾', label: 'All Payments',     roles: ['admin'] },
  { to: '/events',          icon: '📆', label: 'Events',           roles: ['admin','student'] },
  { to: '/announcements',   icon: '📢', label: 'Announcements',    roles: ['admin','student'] },
  { to: '/settings',        icon: '⚙️', label: 'Settings',         roles: ['admin','teacher'] },
];

const ROLE_COLORS = { admin: '#3b82f6', teacher: '#10b981', student: '#f59e0b' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const visibleNav = navItems.filter(item => item.roles.includes(user?.role));

  const Sidebar = ({ mobile = false }) => (
    <aside style={{
      width: 220, background: 'linear-gradient(180deg, #0f172a, #111827)', color: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: mobile ? 'relative' : 'fixed',
      top: 0, left: 0, zIndex: 200, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>🏫 SchoolMS</div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Management System</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px' }}>
        {visibleNav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, margin: '2px 0',
              textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? '#3b82f6' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #1e293b' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{user?.name}</div>
        <div style={{ display: 'inline-block', fontSize: 10, background: ROLE_COLORS[user?.role], color: '#fff', borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{user?.role}</div>
        <button onClick={handleLogout} style={{ display: 'block', width: '100%', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 6, padding: '8px', cursor: 'pointer', fontSize: 12, transition: 'background 0.15s' }}>
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div style={{ display: window.innerWidth < 768 ? 'none' : 'block' }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199, display: 'flex' }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', position: 'absolute', inset: 0 }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', zIndex: 200 }}><Sidebar mobile /></div>
        </div>
      )}

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', background: '#f1f5f9', minHeight: '100vh' }}>
        {/* Top navbar */}
        <header style={{ background: '#fff', padding: '12px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', display: 'none' }}>☰</button>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: ROLE_COLORS[user?.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1400 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
