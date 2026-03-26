import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';

export default function Inventaire() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduit, setCurrentProduit] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_achat: 0,
    prix_vente: 0,
    stock_actuel: 0,
    seuil_alerte: 5,
    categorie: ''
  });

  const fetchProduits = async () => {
    setLoading(true);
    let query = supabase.from('produits').select('*').order('nom', { ascending: true });
    
    if (search) {
      query = query.ilike('nom', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) console.error("Erreur de chargement:", error);
    else setProduits(data || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchProduits();
  }, [search]);

  const openModal = (produit = null) => {
    if (produit) {
      setFormData(produit);
      setCurrentProduit(produit);
    } else {
      setFormData({
        nom: '', description: '', prix_achat: 0, prix_vente: 0, stock_actuel: 0, seuil_alerte: 5, categorie: ''
      });
      setCurrentProduit(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduit(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentProduit) {
      // Update
      const { error } = await supabase
        .from('produits')
        .update(formData)
        .eq('id', currentProduit.id);
        
      if (!error) {
        fetchProduits();
        closeModal();
      } else alert("Erreur lors de la modification");
    } else {
      // Insert
      const { error } = await supabase
        .from('produits')
        .insert([formData]);
        
      if (!error) {
        fetchProduits();
        closeModal();
      } else alert("Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      const { error } = await supabase.from('produits').delete().eq('id', id);
      if (!error) fetchProduits();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un produit
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Prix Réf.</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : produits.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Aucun produit trouvé dans l'inventaire.</td></tr>
              ) : (
                produits.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.nom}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                        {p.categorie || 'Non classé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{p.prix_vente} DZD</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`font-semibold ${p.stock_actuel <= p.seuil_alerte ? 'text-red-600' : 'text-green-600'}`}>
                          {p.stock_actuel}
                        </span>
                        {p.stock_actuel <= p.seuil_alerte && (
                          <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(p)} className="text-gray-400 hover:text-primary transition-colors">
                        <Edit2 className="w-5 h-5 inline" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-danger transition-colors">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {currentProduit ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nom du produit *</label>
                  <input required name="nom" value={formData.nom} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Catégorie</label>
                  <input name="categorie" value={formData.categorie} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Prix d'achat (DZD)</label>
                  <input type="number" step="0.01" required name="prix_achat" value={formData.prix_achat} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Prix de vente (DZD) *</label>
                  <input type="number" step="0.01" required name="prix_vente" value={formData.prix_vente} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Stock Actuel</label>
                  <input type="number" required name="stock_actuel" value={formData.stock_actuel} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Seuil d'alerte</label>
                  <input type="number" required name="seuil_alerte" value={formData.seuil_alerte} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                  {currentProduit ? 'Enregistrer les modifications' : 'Ajouter le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
