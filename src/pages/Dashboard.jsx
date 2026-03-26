import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, PackageX, Package, Activity } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    ventesAujourdhui: 0,
    produitsAlerte: 0,
    totalProduits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        // 1. Fetch Today's Sales
        const { data: ventes, error: errVentes } = await supabase
          .from('ventes')
          .select('total')
          .gte('date_vente', startOfDay.toISOString());
          
        const ventesAujourdhui = ventes ? ventes.reduce((sum, v) => sum + Number(v.total), 0) : 0;

        // 2. Fetch Total Products
        const { count: totalProduits } = await supabase
          .from('produits')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch Low Stock Products
        // Need to query where stock_actuel <= seuil_alerte. Supabase requires a filter, 
        // but we can't easily compare two columns directly via standard simple filters in client,
        // so we'll fetch them all or do a raw RPC. For now, we'll fetch products and filter in JS 
        // for simplicity since inventory isn't millions of rows.
        const { data: produits } = await supabase
          .from('produits')
          .select('stock_actuel, seuil_alerte');
          
        const produitsAlerte = produits ? produits.filter(p => p.stock_actuel <= p.seuil_alerte).length : 0;

        setStats({
          ventesAujourdhui,
          totalProduits: totalProduits || 0,
          produitsAlerte,
        });
      } catch (error) {
        console.error("Erreur de chargement du dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const cards = [
    {
      title: "Ventes du jour",
      value: `${stats.ventesAujourdhui.toFixed(2)} DZD`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      title: "Articles en alerte stock",
      value: stats.produitsAlerte,
      icon: PackageX,
      color: "text-red-600",
      bg: "bg-red-100"
    },
    {
      title: "Total références",
      value: stats.totalProduits,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "État du système",
      value: "Actif",
      icon: Activity,
      color: "text-white",
      bg: "bg-primary"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      
      {loading ? (
        <div className="text-gray-500">Chargement des données...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
              <div className={`p-4 rounded-full ${card.bg}`}>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder for future charts or recent activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Activité récente</h2>
        <p className="text-gray-500 italic">Aucune activité récente à afficher pour le moment.</p>
      </div>
    </div>
  );
}
