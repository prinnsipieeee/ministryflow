import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const navItems = [
  { path: '/', label: '🏠 Dashboard', exact: true },
  { path: '/schedule', label: '📅 Schedule' },
  { path: '/tech', label: '🎥 Tech Team' },
  { path: '/decors', label: '💡 Decors & Lights' },
  { path: '/music', label: '🎸 Music Team' },
  { path: '/usher', label: '🙋 Usher Team' },
  { path: '/admin', label: '👥 Admin Panel' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
  // Trigger the confirmation alert
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You will be redirected to the login page.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0C447C',
    cancelButtonColor: '#f1f5f9',
    confirmButtonText: 'Yes, Log out',
    cancelButtonText: '<span style="color: #64748b; font-weight: 600;">Cancel</span>'
  });

  // If the user clicks "Yes", execute the logout
  if (result.isConfirmed) {
    logout(); // This is the function from your AuthContext
    
    // Optional: Show a quick success message before redirecting
    Swal.fire({
      title: 'Logged Out',
      text: 'See you next time!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  }
};

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.cross}>✝</div>
        <div>
          <div style={styles.logoTitle}>MinistryFlow</div>
          <div style={styles.logoSub}>DCJCC</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            style={({ isActive }) => ({
              ...styles.navItem,
              background: isActive ? '#E6F1FB' : 'transparent',
              color: isActive ? '#0C447C' : '#185FA5',
              borderLeft: isActive ? '3px solid #185FA5' : '3px solid transparent',
              fontWeight: isActive ? 700 : 500,
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        🚪 Logout
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220, background: '#fff', borderRight: '1px solid #E6F1FB',
    height: '100vh', position: 'fixed', top: 0, left: 0,
    display: 'flex', flexDirection: 'column', padding: '0 0 20px',
    boxShadow: '2px 0 8px rgba(4,44,83,0.06)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '20px 16px', borderBottom: '1px solid #E6F1FB',
  },
  cross: { fontSize: 24, color: '#185FA5' },
  logoTitle: { fontSize: 14, fontWeight: 700, color: '#042C53' },
  logoSub: { fontSize: 11, color: '#888' },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  navItem: {
    display: 'block', padding: '10px 16px', fontSize: 13,
    textDecoration: 'none', transition: 'all 0.15s',
  },
  logoutBtn: {
    margin: '0 16px', padding: '9px', background: 'transparent',
    border: '1px solid #B5D4F4', borderRadius: 8, color: '#185FA5',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
};