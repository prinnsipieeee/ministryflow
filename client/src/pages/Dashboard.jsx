import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import API from '../api/axios';

const verses = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", ref: "Jeremiah 29:11" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
];

const teamCards = [
  { label: 'Tech Team', icon: '🎥', path: '/tech', color: '#185FA5' },
  { label: 'Decors & Lights', icon: '💡', path: '/decors', color: '#0F6E56' },
  { label: 'Music Team', icon: '🎸', path: '/music', color: '#534AB7' },
  { label: 'Usher Team', icon: '🙋', path: '/usher', color: '#854F0B' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({ teams: 0, inventory: 0, members: 0 });
  const verse = verses[new Date().getDay() % verses.length];

  useEffect(() => {
    // Kunin ang lahat ng schedules
    API.get('/schedules')
      .then(res => setSchedules(res.data))
      .catch(err => console.error("Error fetching schedules:", err));

    // Kunin ang counts para sa stats cards
    API.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  return (
    <Layout title="📊 Dashboard">

      {/* Welcome */}
      <div style={s.welcome}>
        Good day, <strong>{user?.name}</strong>! Welcome to MinistryFlow ✝️
      </div>

      {/* Bible Verse */}
      <div style={s.verse}>
        <div style={s.verseLabel}>✝ Daily Bible Verse</div>
        <div style={s.verseText}>"{verse.text}"</div>
        <div style={s.verseRef}>— {verse.ref}</div>
      </div>

      {/* Stats Section */}
      <div style={s.statsGrid}>
        {[
          { icon: '🧩', val: stats.teams, label: 'Ministry Teams' },
          { icon: '📅', val: schedules.length, label: 'Schedules' },
          { icon: '📦', val: stats.inventory, label: 'Inventory Items' },
          { icon: '👥', val: stats.members, label: 'Active Members' },
        ].map((stat, i) => (
          <div key={i} style={s.statCard}>
            <div style={s.statIcon}>{stat.icon}</div>
            <div style={s.statVal}>{stat.val}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Team Cards */}
      <h2 style={s.sectionTitle}>Ministry Teams</h2>
      <div style={s.teamGrid}>
        {teamCards.map((t, i) => (
          <div key={i} style={{ ...s.teamCard, borderTop: `4px solid ${t.color}` }}
            onClick={() => window.location.href = t.path}>
            <div style={s.teamIcon}>{t.icon}</div>
            <div style={s.teamLabel}>{t.label}</div>
            <div style={s.teamArrow}>→</div>
          </div>
        ))}
      </div>

      {/* Upcoming Schedules Table */}
      <h2 style={s.sectionTitle}>Upcoming Schedules</h2>
      <div style={s.card}>
        {schedules.length === 0 ? (
          <p style={{ color: '#888', fontSize: 13 }}>No schedules yet. Add one in Schedule Manager.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Date', 'Type', 'Status'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.slice(0, 5).map(sc => (
                <tr key={sc.id}>
                  {/* Ginamit ang schedule_date at service_type base sa DB mo */}
                  <td style={s.td}>{new Date(sc.schedule_date).toLocaleDateString()}</td>
                  <td style={s.td}><span style={s.pill}>{sc.service_type}</span></td>
                  <td style={s.td}>
                    <span style={{ ...s.pill, background: '#FAEEDA', color: '#633806' }}>
                      Upcoming
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const s = {
  welcome: { fontSize: 15, color: '#042C53', marginBottom: 16, fontWeight: 500 },
  verse: { background: '#0C447C', borderRadius: 14, padding: '20px 24px', color: '#fff', marginBottom: 20 },
  verseLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B5D4F4', marginBottom: 8, fontWeight: 600 },
  verseText: { fontStyle: 'italic', fontSize: 14, lineHeight: 1.65, marginBottom: 8 },
  verseRef: { fontSize: 12, color: '#B5D4F4', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  statCard: { background: '#fff', border: '1px solid #E6F1FB', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(4,44,83,0.06)' },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statVal: { fontSize: 24, fontWeight: 700, color: '#042C53' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 3 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#042C53', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  teamCard: { background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #E6F1FB', cursor: 'pointer', boxShadow: '0 2px 8px rgba(4,44,83,0.06)', transition: 'transform 0.15s' },
  teamIcon: { fontSize: 28, marginBottom: 8 },
  teamLabel: { fontSize: 14, fontWeight: 700, color: '#042C53' },
  teamArrow: { fontSize: 16, color: '#185FA5', marginTop: 8 },
  card: { background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #E6F1FB', boxShadow: '0 2px 8px rgba(4,44,83,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', color: '#888', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', padding: '6px 10px', borderBottom: '1px solid #E6F1FB' },
  td: { padding: '10px 10px', borderBottom: '1px solid #f0f6ff', color: '#042C53' },
  pill: { background: '#E6F1FB', color: '#0C447C', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
};