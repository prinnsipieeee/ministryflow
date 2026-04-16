import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // 1. Show "Processing" Alert
  Swal.fire({
    title: 'Authenticating...',
    text: 'Please wait while we verify your access.',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    console.log('Sending login request...'); 
    const res = await API.post('/auth/login', { email, password });
    console.log('Response:', res.data);

    if (res.data.token && res.data.user) {
      // 2. Success Alert
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: `Welcome back, ${res.data.user.name}!`,
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true
      });

      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (err) {
    console.error('Login error:', err.response?.data);
    const errorMessage = err.response?.data?.message || 'Login failed. Check your credentials.';
    
    // 3. Error Alert
    Swal.fire({
      icon: 'error',
      title: 'Access Denied',
      text: errorMessage,
      confirmButtonColor: '#0C447C'
    });

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cross}>✝</div>
        <h1 style={styles.title}>DCJCC MinistryFlow</h1>
        <p style={styles.sub}>Church Management System</p>

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@dcjcc.org"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0C447C 0%, #185FA5 100%)',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '40px 36px',
    width: 380, boxShadow: '0 8px 32px rgba(4,44,83,0.18)',
    textAlign: 'center',
  },
  cross: { fontSize: 36, color: '#185FA5', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 700, color: '#042C53', marginBottom: 4 },
  sub: { fontSize: 13, color: '#888', marginBottom: 28 },
  field: { textAlign: 'left', marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #B5D4F4', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  },
  error: { color: '#A32D2D', fontSize: 13, marginBottom: 12 },
  btn: {
    width: '100%', padding: '11px', background: '#185FA5',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4,
  },
};