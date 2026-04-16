import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Swal from 'sweetalert2';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Kinuha ang 'user' para malaman kung sino ang naka-login
  const { user } = useAuth(); 

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async () => {
  const { value: formValues } = await Swal.fire({
    title: `
      <div style="display:flex; align-items:center; gap:12px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
        <span style="font-size: 24px;">🛡️</span> 
        <span style="font-size: 18px; font-weight: 800; color: #0C447C; text-transform:uppercase; letter-spacing:1px;">Admin Registration</span>
      </div>`,
    html: `
      <div style="padding: 15px 0 5px 0; font-family: 'Inter', sans-serif;">
        <div style="margin-bottom: 16px; text-align: left;">
          <label style="font-size: 11px; font-weight: 700; color: #64748b; margin-left: 5px; text-transform: uppercase;">Full Name</label>
          <input id="swal-name" class="swal2-input custom-input" placeholder="Juan Dela Cruz">
        </div>
        
        <div style="margin-bottom: 16px; text-align: left;">
          <label style="font-size: 11px; font-weight: 700; color: #64748b; margin-left: 5px; text-transform: uppercase;">Email Address</label>
          <input id="swal-email" type="email" class="swal2-input custom-input" placeholder="juan@dcjcc.org">
        </div>

        <div style="margin-bottom: 16px; text-align: left; position: relative;">
          <label style="font-size: 11px; font-weight: 700; color: #64748b; margin-left: 5px; text-transform: uppercase;">Password</label>
          <input id="swal-password" type="password" class="swal2-input custom-input" placeholder="••••••••">
          <span id="togglePassword" style="position: absolute; right: 15px; top: 32px; cursor: pointer; font-size: 18px; color: #64748b;">👁️</span>
        </div>

        <div style="margin-bottom: 16px; text-align: left;">
          <label style="font-size: 11px; font-weight: 700; color: #64748b; margin-left: 5px; text-transform: uppercase;">Confirm Password</label>
          <input id="swal-confirm-password" type="password" class="swal2-input custom-input" placeholder="••••••••">
        </div>

        <div style="text-align: left;">
          <label style="font-size: 11px; font-weight: 700; color: #64748b; margin-left: 5px; text-transform: uppercase;">Access Level</label>
          <select id="swal-role" class="swal2-input custom-select">
            <option value="admin">System Admin</option>
            <option value="head_admin">Head Admin</option>
          </select>
        </div>
      </div>

      <style>
        .custom-input, .custom-select {
          width: 100% !important;
          height: 45px !important;
          margin: 5px 0 0 0 !important;
          border-radius: 25px !important; /* Fully Rounded */
          border: 1px solid #cbd5e1 !important;
          font-size: 14px !important;
          padding: 0 20px !important;
          box-sizing: border-box !important;
          transition: border-color 0.2s;
        }
        .custom-input:focus, .custom-select:focus {
          border-color: #0C447C !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(12, 68, 124, 0.1) !important;
        }
        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C2.185 5.355 2.403 5 2.808 5h9.384c.405 0 .623.355.357.658l-4.796 5.482a.5.5 0 0 1-.748 0z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 20px center;
        }
      </style>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Create Account',
    confirmButtonColor: '#0C447C',
    cancelButtonColor: '#f1f5f9',
    cancelButtonText: '<span style="color: #64748b; font-weight: 600;">Cancel</span>',
    didOpen: () => {
      const toggleBtn = document.getElementById('togglePassword');
      const passwordInput = document.getElementById('swal-password');
      const confirmInput = document.getElementById('swal-confirm-password');
      
      toggleBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        confirmInput.type = type;
        toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
      });
    },
    preConfirm: () => {
      const name = document.getElementById('swal-name').value;
      const email = document.getElementById('swal-email').value;
      const password = document.getElementById('swal-password').value;
      const confirmPassword = document.getElementById('swal-confirm-password').value;
      const role = document.getElementById('swal-role').value;

      if (!name || !email || !password || !confirmPassword) {
        Swal.showValidationMessage('Pakisagutan lahat ng fields.');
        return false;
      }

      // Matching Logic (Gaya ng Facebook/IG)
      if (password !== confirmPassword) {
        Swal.showValidationMessage('Passwords do not match. Pakicheck ulit.');
        return false;
      }

      return { name, email, password, role };
    }
  });

  if (formValues) {
    try {
      Swal.fire({
        title: 'Saving...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await API.post('/users/register', formValues);
      
      Swal.fire({
        icon: 'success',
        title: 'User Added!',
        text: `Successfully registered ${formValues.name}`,
        confirmButtonColor: '#0C447C'
      });
      fetchUsers();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Check your database connection.',
        confirmButtonColor: '#0C447C'
      });
    }
  }
};

  const handleDelete = async (targetId, targetName) => {
    // SECURITY RULES (RBAC)
    if (user?.role !== 'head_admin') {
      Swal.fire('Access Denied', 'Tanging Head Admin lamang ang pwedeng mag-delete.', 'error');
      return;
    }

    // SELF-PRESERVATION
    if (targetId === user?.id) {
      Swal.fire('Action Forbidden', 'Hindi mo pwedeng i-delete ang sarili mong account.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: `Delete ${targetName}?`,
      text: "Hindi na ito maibabalik!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await API.delete(`/users/${targetId}`);
        Swal.fire('Deleted!', 'User has been removed.', 'success');
        fetchUsers();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    }
  };

  return (
    <Layout title="🔐 Admin Panel">
      <div style={s.header}>
        <h2 style={s.title}>User Management</h2>
        <button style={s.addBtn} onClick={handleAddUser}>+ Add User</button>
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Username</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={s.td}><strong>{u.name}</strong></td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}>
                  <span style={{
                    ...s.roleBadge,
                    backgroundColor: u.role === 'head_admin' ? '#dcfce7' : '#dbeafe',
                    color: u.role === 'head_admin' ? '#15803d' : '#1d4ed8'
                  }}>
                    {u.role === 'head_admin' ? 'Head Admin' : 'System Admin'}
                  </span>
                </td>
                <td style={s.td}>
                  {/* Tanging Head Admin lang ang nakakakita ng Delete button at itatago ito sa sariling account */}
                  {user?.role === 'head_admin' && u.id !== user?.id && (
                    <button style={s.deleteBtn} onClick={() => handleDelete(u.id, u.name)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, color: '#042C53', fontWeight: 700 },
  addBtn: { background: '#0C447C', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  card: { background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E6F1FB', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #E6F1FB', color: '#888', fontSize: 12, textTransform: 'uppercase' },
  td: { padding: '12px', borderBottom: '1px solid #f0f6ff', color: '#042C53', fontSize: 14 },
  roleBadge: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' },
  deleteBtn: { background: 'none', border: 'none', color: '#d33', cursor: 'pointer', fontWeight: 600, fontSize: 13 }
};