import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventaire from './pages/Inventaire';
import POS from './pages/POS';
import Historique from './pages/Historique';
import Clients from './pages/Clients';
import Login from './pages/Login';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {session ? (
          <Route path="/" element={<Layout session={session} />}>
            <Route index element={<Dashboard />} />
            <Route path="inventaire" element={<Inventaire />} />
            <Route path="pos" element={<POS />} />
            <Route path="historique" element={<Historique />} />
            <Route path="clients" element={<Clients />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
