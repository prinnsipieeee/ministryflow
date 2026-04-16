import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import Swal from 'sweetalert2'; // Siguraduhing installed ito: npm install sweetalert2

export default function TeamPanel({ teamName, teamId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    category: '', 
    quantity: '', 
    condition_status: 'Good' 
  });

  useEffect(() => {
    fetchInventory();
  }, [teamId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/inventory/${teamId}`);
      setItems(res.data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        name: item.name, 
        category: item.category, 
        quantity: item.quantity, 
        condition_status: item.condition_status 
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', category: '', quantity: '', condition_status: 'Good' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/inventory/${editingId}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Resource has been updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await API.post('/inventory', { ...formData, team_id: teamId });
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'New resource added to inventory.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) { 
      Swal.fire('Error', 'Action failed. Please check your connection.', 'error');
    }
  };

  // Modern Delete Confirmation gamit ang Swal
  const handleDelete = (item) => {
    Swal.fire({
      title: `Delete ${item.name}?`,
      text: "Are you sure? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D62828',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/inventory/${item.id}`);
          fetchInventory();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Item has been removed.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (err) { 
          Swal.fire('Error', 'Failed to delete the item.', 'error');
        }
      }
    });
  };

  return (
    <Layout title={`${teamName} Administration`}>
      
      {/* Header Section */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>{teamName}</h1>
          <p style={s.subtitle}>Overview of resources, equipment, and status</p>
        </div>
        <button onClick={() => handleOpenModal()} style={s.addButton}>
          + Add New Entry
        </button>
      </div>

      {/* Analytics Cards */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statLabel}>Total Inventory</div>
          <div style={s.statVal}>{items.length}</div>
        </div>
        <div style={s.statCard}>
          <div style={{...s.statLabel, color: '#2D6A4F'}}>Operational</div>
          <div style={{...s.statVal, color: '#2D6A4F'}}>
            {items.filter(i => i.condition_status === 'Good').length}
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{...s.statLabel, color: '#BC6C25'}}>Needs Attention</div>
          <div style={{...s.statVal, color: '#BC6C25'}}>
            {items.filter(i => i.condition_status !== 'Good').length}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={s.tableContainer}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Resource Name</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Quantity</th>
              <th style={s.th}>Condition</th>
              <th style={{...s.th, textAlign: 'right'}}>Management</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={s.tr}>
                <td style={{...s.td, fontWeight: 600}}>{item.name}</td>
                <td style={s.td}>{item.category}</td>
                <td style={s.td}><span style={s.qtyBadge}>{item.quantity}</span></td>
                <td style={s.td}>
                   <span style={{
                     ...s.pill, 
                     background: item.condition_status === 'Good' ? '#D8F3DC' : '#FEFAE0', 
                     color: item.condition_status === 'Good' ? '#1B4332' : '#99582A'
                   }}>
                     {item.condition_status}
                   </span>
                </td>
                <td style={{...s.td, textAlign: 'right'}}>
                  <button onClick={() => handleOpenModal(item)} style={s.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(item)} style={s.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editingId ? 'Modify Resource' : 'Register New Resource'}</h2>
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.inputWrapper}>
                <label style={s.label}>Item Name</label>
                <input 
                  value={formData.name} 
                  style={s.input} 
                  placeholder="e.g., Wireless Mic"
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div style={s.flexRow}>
                <div style={{ flex: 3 }}>
                  <label style={s.label}>Category</label>
                  <input 
                    value={formData.category} 
                    style={s.input} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    required 
                  />
                </div>
                <div style={{ flex: 1.5 }}>
                  <label style={s.label}>Qty</label>
                  <input 
                    value={formData.quantity} 
                    type="number" 
                    style={s.input} 
                    onChange={e => setFormData({...formData, quantity: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div style={s.inputWrapper}>
                <label style={s.label}>Condition Status</label>
                <select 
                  value={formData.condition_status} 
                  style={s.input} 
                  onChange={e => setFormData({...formData, condition_status: e.target.value})}
                >
                  <option value="Good">Good</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>
              <div style={s.modalFooter}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={s.secondaryBtn}>Cancel</button>
                <button type="submit" style={s.primaryBtn}>{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, color: '#042C53', margin: 0 },
  subtitle: { fontSize: 14, color: '#666', margin: '4px 0 0' },
  addButton: { background: '#0C447C', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(12,68,124,0.2)' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 30 },
  statCard: { background: '#fff', border: '1px solid #E6F1FB', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(4,44,83,0.04)' },
  statLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 700 },
  statVal: { fontSize: 32, fontWeight: 800, color: '#042C53', marginTop: 8 },

  tableContainer: { background: '#fff', borderRadius: '16px', border: '1px solid #E6F1FB', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', padding: '16px 20px', borderBottom: '1px solid #F0F5FA' },
  td: { padding: '16px 20px', borderBottom: '1px solid #F8FAFD', color: '#042C53' },
  
  pill: { padding: '5px 12px', borderRadius: '30px', fontSize: 11, fontWeight: 700, display: 'inline-block' },
  qtyBadge: { background: '#F0F5FA', color: '#0C447C', padding: '4px 10px', borderRadius: '8px', fontWeight: 700, fontSize: 12 },
  
  editBtn: { background: 'none', border: 'none', color: '#185FA5', fontWeight: 700, cursor: 'pointer', marginRight: 15 },
  deleteBtn: { background: 'none', border: 'none', color: '#D62828', fontWeight: 700, cursor: 'pointer' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(4, 44, 83, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { background: '#fff', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalTitle: { margin: '0 0 24px', fontSize: 22, color: '#042C53', fontWeight: 800 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  flexRow: { display: 'flex', gap: 16 },
  inputWrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: '#444' },
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: '12px', border: '1px solid #DCE9F7', outline: 'none', fontSize: 14, color: '#042C53' },
  
  modalFooter: { display: 'flex', gap: 12, marginTop: 12 },
  primaryBtn: { flex: 2, background: '#0C447C', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }
};