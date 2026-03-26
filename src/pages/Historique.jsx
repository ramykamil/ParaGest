import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Calendar, CreditCard, Banknote, Building } from 'lucide-react';

export default function Historique() {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVentes();
  }, []);

  const fetchVentes = async () => {
    setLoading(true);
    // Join with ligne_ventes and produits to get full details of each sale
    const { data, error } = await supabase
      .from('ventes')
      .select(`
        *,
        ligne_ventes (
          id, quantite, prix_unitaire,
          produits (
            nom
          )
        )
      `)
      .order('date_vente', { ascending: false });

    if (error) console.error("Erreur de chargement de l'historique:", error);
    else setVentes(data || []);
    setLoading(false);
  };

  const getPaymentIcon = (method) => {
    if (method === 'Carte') return <CreditCard className="w-4 h-4 text-blue-500 mr-2" />;
    if (method === 'Virement') return <Building className="w-4 h-4 text-purple-500 mr-2" />;
    return <Banknote className="w-4 h-4 text-green-500 mr-2" />; // Espèces
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const [expandedSaleId, setExpandedSaleId] = useState(null);

  const toggleDetails = (id) => {
    if (expandedSaleId === id) setExpandedSaleId(null);
    else setExpandedSaleId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Historique des Ventes</h1>
        <button 
          onClick={fetchVentes}
          className="bg-white border border-gray-200 text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <Calendar className="w-5 h-5 mr-2 text-gray-400" />
          Actualiser
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Référence & Date</th>
                <th className="px-6 py-4 font-medium text-center">Articles</th>
                <th className="px-6 py-4 font-medium">Paiement</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : ventes.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Aucune vente enregistrée.</td></tr>
              ) : (
                ventes.map(v => (
                  <React.Fragment key={v.id}>
                    <tr 
                      onClick={() => toggleDetails(v.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3 group-hover:text-primary transition-colors" />
                          <div>
                            <p className="text-xs text-gray-400 font-mono mb-0.5">{v.id.split('-')[0]}</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(v.date_vente)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600 font-medium">
                        {v.ligne_ventes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md inline-flex text-sm font-medium border border-gray-100">
                          {getPaymentIcon(v.methode_paiement)}
                          {v.methode_paiement}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                        {v.total} DZD
                      </td>
                    </tr>
                    
                    {/* Collapsible details row */}
                    {expandedSaleId === v.id && v.ligne_ventes && v.ligne_ventes.length > 0 && (
                      <tr className="bg-blue-50/50 border-t-0">
                        <td colSpan="4" className="px-14 py-4">
                          <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider">Détails de la commande</h4>
                          <div className="space-y-2">
                            {v.ligne_ventes.map(ligne => (
                              <div key={ligne.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                <span className="font-medium text-gray-800">
                                  {ligne.produits?.nom || 'Produit inconnu'}
                                </span>
                                <div className="text-gray-500 flex items-center space-x-6">
                                  <span>{ligne.quantite} x {ligne.prix_unitaire} DZD</span>
                                  <span className="font-bold text-gray-900 w-24 text-right">
                                    {(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DZD
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Ensure React is imported to use React.Fragment
import React from 'react';
