import { useAuth } from '../context/AuthContext';

export default function Header({ title }) {
  const { user } = useAuth();

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.right}>
        <div style={styles.role}>
          {user?.role === 'head_admin' ? '👑' : '🧑‍💼'} {user?.role?.replace('_', ' ')}
        </div>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 56, background: '#0C447C', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', position: 'fixed',
    top: 0, left: 220, right: 0, zIndex: 100,
    boxShadow: '0 2px 8px rgba(4,44,83,0.15)',
  },
  title: { color: '#fff', fontSize: 16, fontWeight: 700 },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  role: {
    background: '#185FA5', color: '#fff', fontSize: 11,
    fontWeight: 600, padding: '3px 10px', borderRadius: 20,
    textTransform: 'capitalize',
  },
  avatar: {
    width: 32, height: 32, background: '#fff', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#0C447C',
  },
};