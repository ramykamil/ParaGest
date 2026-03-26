import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventaire from './pages/Inventaire';
import POS from './pages/POS';
import Historique from './pages/Historique';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventaire" element={<Inventaire />} />
          <Route path="pos" element={<POS />} />
          <Route path="historique" element={<Historique />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
