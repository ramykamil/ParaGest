import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, History, Activity, Users, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export default function Layout({ session }) {
  const [profil, setProfil] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('profils')
        .select('nom, role')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfil(data);
        });
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { to: '/', name: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/inventaire', name: 'Inventaire', icon: Package },
    { to: '/pos', name: 'Point de Vente', icon: ShoppingCart },
    { to: '/historique', name: 'Historique', icon: History },
    { to: '/clients', name: 'Clients', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center justify-center py-6 border-b border-gray-200">
          <Activity className="w-8 h-8 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Para<span className="text-primary">Gest</span></h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {profil?.nom || session?.user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {profil?.role || 'Personnel'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Owner Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-center">
          <p className="text-xs font-medium text-gray-500">Ramy Kamil Mecheri</p>
          <p className="text-[10px] text-gray-400">ramy.mecherim2@gmail.com</p>
          <p className="text-[10px] text-gray-400">+213 664 975 983</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
