import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, title }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
        <Header title={title} />
        <main style={{ padding: 24, marginTop: 56 }}>
          {children}
        </main>
      </div>
    </div>
  );
}