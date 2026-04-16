import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';
import Swal from 'sweetalert2';

const SERVICES = ['1st Service', '2nd Service', 'Jr Youth Service', 'Youth Service'];

const TEAM_ROLES = {
  'Tech Team': ['OBS', 'TV1 / PPT', 'Mixer Man', 'Mic Handler'],
  'Music Team': [
    'Song Lead', 'Drummer', 'Lead Guitar', 'Bass Guitar',
    'Backup Vocalist 1', 'Backup Vocalist 2', 'Backup Vocalist 3',
    'Pianist', 'Acoustic Guitar',
  ],
  'Decors & Lights': ['Lights Operator'],
  'Usher Team': [
    'Envelope Setter', 'Attendance Checker',
    'Assist', 'Tithes',
    'Communion Cups (1st Sunday)',
  ],
};

const TEAM_IDS = {
  'Tech Team': 1,
  'Decors & Lights': 2,
  'Music Team': 3,
  'Usher Team': 4,
};

const SERVICE_COLORS = {
  '1st Service':      { bg: '#185FA5', text: '#fff' },
  '2nd Service':      { bg: '#0F6E56', text: '#fff' },
  'Jr Youth Service': { bg: '#534AB7', text: '#fff' },
  'Youth Service':    { bg: '#854F0B', text: '#fff' },
};

const TEAM_COLOR = {
  'Tech Team':        { accent: '#185FA5', light: '#E6F1FB', text: '#0C447C' },
  'Music Team':       { accent: '#534AB7', light: '#EEEDFE', text: '#3C3489' },
  'Decors & Lights':  { accent: '#0F6E56', light: '#E1F5EE', text: '#085041' },
  'Usher Team':       { accent: '#854F0B', light: '#FAEEDA', text: '#633806' },
};

// ─── Color Code Section ───────────────────────────────────────────────────────
function ColorCodeSection() {
  const [codes, setCodes] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const colorTeams = ['Music Team', 'Usher Team'];

  useEffect(() => {
    API.get('/schedules/colorcodes/all')
      .then(res => {
        const map = {};
        res.data.forEach(c => {
          const key = `${c.team_name}__${c.service_type}`;
          map[key] = { color_code: c.color_code, description: c.description };
        });
        setCodes(map);
      }).catch(() => {});
  }, []);

  const handleChange = (team, service, field, val) => {
    const key = `${team}__${service}`;
    setCodes(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: val }
    }));
  };

  const handleSave = async () => {
  setSaving(true);
  try {
    for (const team of colorTeams) {
      for (const svc of SERVICES) {
        const key = `${team}__${svc}`;
        const entry = codes[key];
        if (entry?.color_code) {
          await API.post('/schedules/colorcodes', {
            team_id: TEAM_IDS[team],
            service_type: svc,
            color_code: entry.color_code,
            description: entry.description || '',
          });
        }
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'Settings Applied!',
      text: 'Color codes have been updated across all teams.',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true
    });

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Save Failed',
      text: 'Hindi na-save ang color codes. Pakicheck ang connection.',
    });
  } finally {
    setSaving(false);
  }
};

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardTitle}>🎨 Color Codes</span>
        <span style={s.cardSub}>Uniform colors per team per service</span>
      </div>

      {colorTeams.map(team => {
        const tc = TEAM_COLOR[team];
        return (
          <div key={team} style={{ marginBottom: 20 }}>
            <div style={{ ...s.teamBadge, background: tc.light, color: tc.text, borderLeft: `4px solid ${tc.accent}` }}>
              {team}
            </div>
            <div style={s.colorGrid}>
              {SERVICES.map(svc => {
                const key = `${team}__${svc}`;
                const entry = codes[key] || { color_code: '#ffffff', description: '' };
                const sc = SERVICE_COLORS[svc];
                return (
                  <div key={svc} style={s.colorCard}>
                    <div style={{ ...s.svcBadge, background: sc.bg, color: sc.text }}>{svc}</div>
                    <div style={s.colorRow}>
                      <input
                        type="color"
                        value={entry.color_code || '#ffffff'}
                        onChange={e => handleChange(team, svc, 'color_code', e.target.value)}
                        style={s.colorPicker}
                        title="Pick color"
                      />
                      <div style={{ ...s.colorPreview, background: entry.color_code || '#fff' }}>
                        <span style={s.colorHex}>{entry.color_code || '#ffffff'}</span>
                      </div>
                    </div>
                    <input
                      style={s.colorDesc}
                      placeholder="e.g. White polo"
                      value={entry.description || ''}
                      onChange={e => handleChange(team, svc, 'description', e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={s.saveRow}>
        <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Color Codes'}
        </button>
      </div>
    </div>
  );
}

// ─── Schedule Form ────────────────────────────────────────────────────────────
function ScheduleForm({ onCreated }) {
  const initAssignments = () => {
    const list = [];
    Object.entries(TEAM_ROLES).forEach(([team, roles]) => {
      roles.forEach(role => {
        list.push({
          team_id: TEAM_IDS[team],
          team_name: team,
          role_name: role,
          assigned_to: '',
          notes: '',
        });
      });
    });
    return list;
  };

  const [form, setForm] = useState({ service_type: '1st Service', schedule_date: '' });
  const [assignments, setAssignments] = useState(initAssignments());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateAssignment = (idx, field, val) => {
    setAssignments(prev => prev.map((a, i) => i === idx ? { ...a, [field]: val } : a));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.schedule_date) return setError('Please select a date.');
  
  setSaving(true);
  setError('');

  try {
    await API.post('/schedules', { ...form, assignments });
    
    Swal.fire({
      icon: 'success',
      title: 'Schedule Saved!',
      text: 'The schedule has been successfully created.',
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });

    setForm({ service_type: '1st Service', schedule_date: '' });
    setAssignments(initAssignments());
    onCreated();
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.response?.data?.message || 'Failed to save schedule.',
    });
    setError(err.response?.data?.message || 'Failed to save.');
  } finally {
    setSaving(false);
  }
};

  const teamGroups = Object.keys(TEAM_ROLES);

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.formTopGrid}>
        <div style={s.field}>
          <label style={s.label}>Service Type *</label>
          <select style={s.input} value={form.service_type}
            onChange={e => setForm({ ...form, service_type: e.target.value })}>
            {SERVICES.map(sv => <option key={sv} value={sv}>{sv}</option>)}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Date *</label>
          <input style={s.input} type="date" value={form.schedule_date}
            onChange={e => setForm({ ...form, schedule_date: e.target.value })} required />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {teamGroups.map(team => {
          const tc = TEAM_COLOR[team];
          const teamAssigns = assignments
            .map((a, idx) => ({ ...a, idx }))
            .filter(a => a.team_name === team);

          return (
            <div key={team} style={{ marginBottom: 20 }}>
              <div style={{ ...s.teamBadge, background: tc.light, color: tc.text, borderLeft: `4px solid ${tc.accent}` }}>
                {team}
              </div>
              <div style={s.rolesGrid}>
                {teamAssigns.map(a => (
                  <div key={a.idx} style={s.roleCard}>
                    <div style={{ ...s.roleName, color: tc.accent }}>{a.role_name}</div>
                    <input
                      style={s.input}
                      placeholder="Assigned to..."
                      value={a.assigned_to}
                      onChange={e => updateAssignment(a.idx, 'assigned_to', e.target.value)}
                    />
                    <input
                      style={{ ...s.input, marginTop: 6, fontSize: 11, color: '#888' }}
                      placeholder="Notes (optional)"
                      value={a.notes}
                      onChange={e => updateAssignment(a.idx, 'notes', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={s.formFooter}>
        <button type="submit" style={s.saveBtn} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Schedule'}
        </button>
      </div>
    </form>
  );
}

// ─── Schedule Card ────────────────────────────────────────────────────────────
function ScheduleCard({ schedule, onDelete, onUpdate }) {
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);
  const sc = SERVICE_COLORS[schedule.service_type];

  const loadDetail = useCallback(async () => {
    if (open && !detail) {
      try {
        const res = await API.get(`/schedules/${schedule.id}`);
        setDetail(res.data);
      } catch {}
    }
  }, [open, detail, schedule.id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  // BAGONG FEATURE: Inline Edit para sa bawat member
  const handleInlineEdit = (item) => {
    Swal.fire({
      title: `Edit ${item.role_name}`,
      input: 'text',
      inputValue: item.assigned_to || '',
      showCancelButton: true,
      confirmButtonText: 'Update Name',
      confirmButtonColor: '#185FA5',
      inputPlaceholder: 'Enter new name...'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Tatawag sa backend endpoint para i-update ang assigned_to
          await API.put(`/schedules/assignments/${item.id}`, { assigned_to: result.value });
          
          Swal.fire({ icon: 'success', title: 'Updated!', timer: 1000, showConfirmButton: false });
          
          // I-reset ang detail para mag-reload ang data
          setDetail(null);
          loadDetail();
        } catch (err) {
          Swal.fire('Error', 'Hindi ma-update ang name.', 'error');
        }
      }
    });
  };

  const grouped = detail?.assignments?.reduce((acc, a) => {
    acc[a.team_name] = acc[a.team_name] || [];
    acc[a.team_name].push(a);
    return acc;
  }, {}) || {};

  return (
    <div style={s.schedCard}>
      <div style={s.schedCardHeader} onClick={() => setOpen(!open)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...s.svcBadge, background: sc.bg, color: sc.text, fontSize: 12 }}>
            {schedule.service_type}
          </span>
          <span style={s.schedDate}>
            {new Date(schedule.schedule_date).toLocaleDateString('en-PH', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
            })}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={s.chevron}>{open ? '▲' : '▼'}</span>
          <button style={s.deleteBtn} onClick={e => { e.stopPropagation(); onDelete(schedule.id); }}>
            🗑
          </button>
        </div>
      </div>

      {open && (
        <div style={s.schedBody}>
          {Object.keys(grouped).length === 0 ? (
            <p style={s.empty}>Loading assignments...</p>
          ) : (
            Object.entries(grouped).map(([team, roles]) => {
              const tc = TEAM_COLOR[team] || { accent: '#185FA5', light: '#E6F1FB', text: '#0C447C' };
              return (
                <div key={team} style={{ marginBottom: 16 }}>
                  <div style={{ ...s.teamBadge, background: tc.light, color: tc.text, borderLeft: `4px solid ${tc.accent}`, marginBottom: 8 }}>
                    {team}
                  </div>
                  <div style={s.assignGrid}>
                    {roles.map(r => (
                      <div 
                        key={r.id} 
                        style={{ ...s.assignCard, cursor: 'pointer' }} 
                        onClick={() => handleInlineEdit(r)}
                        title="Click to edit name"
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: tc.accent, marginBottom: 4 }}>
                          {r.role_name}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#042C53' }}>
                          {r.assigned_to || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Unassigned</span>}
                        </div>
                        {r.notes && <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{r.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SchedulePanel() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('list');

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/schedules');
      setSchedules(res.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

const handleDelete = (id) => {
  Swal.fire({
    title: 'Delete this schedule?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it',
    confirmButtonColor: '#db0303',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await API.delete(`/schedules/${id}`);
        fetchSchedules();
        Swal.fire('Deleted!', 'Schedule has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete.', 'error');
      }
    }
  });
};

  const handleCreated = () => {
    fetchSchedules();
    setTab('list');
  };

  const stats = SERVICES.map(sv => ({
    label: sv,
    val: schedules.filter(s => s.service_type === sv).length,
    ...SERVICE_COLORS[sv],
  }));

  return (
    <Layout title="📅 Schedule Manager">

      {/* Stats */}
      <div style={s.statsRow}>
        {stats.map(st => (
          <div key={st.label} style={{ ...s.statCard, background: st.bg }}>
            <div style={{ ...s.statVal, color: st.text }}>{st.val}</div>
            <div style={{ ...s.statLabel, color: st.text }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { key: 'list', label: '📋 Schedules' },
          { key: 'new', label: '➕ New Schedule' },
          { key: 'colors', label: '🎨 Color Codes' },
        ].map(t => (
          <button key={t.key} style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={s.card}>
        {tab === 'list' && (
          <>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>All Schedules</span>
              <span style={s.cardSub}>{schedules.length} total</span>
            </div>
            {loading ? (
              <p style={s.empty}>Loading...</p>
            ) : schedules.length === 0 ? (
              <p style={s.empty}>No schedules yet. Click "New Schedule" to create one.</p>
            ) : (
              schedules.map(sc => (
                <ScheduleCard key={sc.id} schedule={sc} onDelete={handleDelete} />
              ))
            )}
          </>
        )}

        {tab === 'new' && (
          <>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Create New Schedule</span>
              <span style={s.cardSub}>Fill in all team assignments</span>
            </div>
            <ScheduleForm onCreated={handleCreated} />
          </>
        )}

        {tab === 'colors' && <ColorCodeSection />}
      </div>
    </Layout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  statCard: { borderRadius: 12, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  statVal: { fontSize: 26, fontWeight: 700 },
  statLabel: { fontSize: 11, fontWeight: 600, marginTop: 4, opacity: 0.85 },
  tabs: { display: 'flex', gap: 8, marginBottom: 16 },
  tab: {
    padding: '8px 18px', borderRadius: 8, border: '1px solid #B5D4F4',
    background: '#fff', color: '#185FA5', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  tabActive: { background: '#185FA5', color: '#fff', border: '1px solid #185FA5' },
  card: {
    background: '#fff', borderRadius: 14, padding: '20px 24px',
    border: '1px solid #E6F1FB', boxShadow: '0 2px 12px rgba(4,44,83,0.07)',
  },
  cardHeader: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#042C53' },
  cardSub: { fontSize: 12, color: '#888' },
  errorBox: {
    background: '#FCEBEB', color: '#A32D2D', border: '1px solid #F09595',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },
  formTopGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: {},
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid #B5D4F4', fontSize: 13, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: '#f7faff',
  },
  teamBadge: {
    padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    marginBottom: 10,
  },
  rolesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  roleCard: {
    background: '#f7faff', border: '1px solid #E6F1FB',
    borderRadius: 10, padding: '12px 14px',
  },
  roleName: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  formFooter: { marginTop: 24, display: 'flex', justifyContent: 'flex-end' },
  saveBtn: {
    background: '#185FA5', color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 24px', fontSize: 13,
    fontWeight: 700, cursor: 'pointer',
  },
  schedCard: {
    border: '1px solid #E6F1FB', borderRadius: 12,
    marginBottom: 12, overflow: 'hidden',
  },
  schedCardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', cursor: 'pointer', background: '#f7faff',
    transition: 'background 0.15s',
  },
  schedDate: { fontSize: 14, fontWeight: 600, color: '#042C53' },
  chevron: { fontSize: 11, color: '#888' },
  schedBody: { padding: '16px 20px', borderTop: '1px solid #E6F1FB' },
  assignGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 },
  assignCard: {
    background: '#f7faff', border: '1px solid #E6F1FB',
    borderRadius: 8, padding: '10px 12px',
  },
  svcBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700,
  },
  deleteBtn: {
    background: 'transparent', border: '1px solid #F09595',
    color: '#A32D2D', borderRadius: 6, padding: '4px 8px',
    fontSize: 11, cursor: 'pointer',
  },
  colorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 8 },
  colorCard: {
    background: '#f7faff', border: '1px solid #E6F1FB',
    borderRadius: 10, padding: '12px',
  },
  colorRow: { display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' },
  colorPicker: { width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0 },
  colorPreview: {
    flex: 1, height: 36, borderRadius: 6, border: '1px solid #E6F1FB',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  colorHex: { fontSize: 10, fontWeight: 700, color: '#555', mixBlendMode: 'difference' },
  colorDesc: {
    width: '100%', padding: '6px 10px', borderRadius: 6,
    border: '1px solid #B5D4F4', fontSize: 11, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: '#fff',
  },
  saveRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  empty: { color: '#888', fontSize: 13, textAlign: 'center', padding: '20px 0' },
};