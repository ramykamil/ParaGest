import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, History, Activity } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { to: '/', name: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/inventaire', name: 'Inventaire', icon: Package },
    { to: '/pos', name: 'Point de Vente', icon: ShoppingCart },
    { to: '/historique', name: 'Historique', icon: History },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center py-6 border-b border-gray-200">
            <Activity className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Para<span className="text-primary">Gest</span></h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
