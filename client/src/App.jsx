import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamPanel from './pages/TeamPanel';
import SchedulePanel from './pages/SchedulePanel';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      
      {/* UPDATE: Ginawa nating dalawa ang route para sa Schedule */}
      {/* Ito yung para sa generic /schedule link sa dashboard */}
      <Route path="/schedule" element={<PrivateRoute><SchedulePanel /></PrivateRoute>} />
      {/* Ito naman yung specific team schedule */}
      <Route path="/schedule" element={<PrivateRoute><SchedulePanel /></PrivateRoute>} />


      <Route path="/tech" element={<PrivateRoute><TeamPanel teamName="Tech Team" teamId={1} /></PrivateRoute>} />
      <Route path="/decors" element={<PrivateRoute><TeamPanel teamName="Decors & Lights" teamId={2} /></PrivateRoute>} />
      <Route path="/music" element={<PrivateRoute><TeamPanel teamName="Music Team" teamId={3} /></PrivateRoute>} />
      <Route path="/usher" element={<PrivateRoute><TeamPanel teamName="Usher Team" teamId={4} /></PrivateRoute>} />
      <Route path="/admin" element={
  <PrivateRoute>
    <AdminPanel />
  </PrivateRoute>
} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;