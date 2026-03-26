import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Search, Phone, Mail, UserPlus } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    type: 'Particulier',
    notes: '',
  });

  const fetchClients = async () => {
    setLoading(true);
    let query = supabase.from('clients').select('*').order('nom', { ascending: true });
    if (search) query = query.ilike('nom', `%${search}%`);
    const { data, error } = await query;
    if (error) console.error("Erreur:", error);
    else setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, [search]);

  const openModal = (client = null) => {
    if (client) {
      setFormData(client);
      setCurrentClient(client);
    } else {
      setFormData({ nom: '', telephone: '', email: '', type: 'Particulier', notes: '' });
      setCurrentClient(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setCurrentClient(null); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { nom: formData.nom, telephone: formData.telephone, email: formData.email, type: formData.type, notes: formData.notes };
    if (currentClient) {
      const { error } = await supabase.from('clients').update(payload).eq('id', currentClient.id);
      if (!error) { fetchClients(); closeModal(); } else alert("Erreur lors de la modification");
    } else {
      const { error } = await supabase.from('clients').insert([payload]);
      if (!error) { fetchClients(); closeModal(); } else alert("Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (!error) fetchClients();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <button onClick={() => openModal()} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm">
          <UserPlus className="w-5 h-5 mr-2" /> Ajouter un client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Téléphone</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Aucun client trouvé.</td></tr>
              ) : (
                clients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.nom}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {c.telephone ? (
                        <span className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" />{c.telephone}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {c.email ? (
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{c.email}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${c.type === 'Professionnel' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(c)} className="text-gray-400 hover:text-primary transition-colors"><Edit2 className="w-5 h-5 inline" /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-danger transition-colors"><Trash2 className="w-5 h-5 inline" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{currentClient ? 'Modifier le client' : 'Nouveau client'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nom complet *</label>
                <input required name="nom" value={formData.nom} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <input name="telephone" value={formData.telephone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="Particulier">Particulier</option>
                  <option value="Professionnel">Professionnel (Médecin, Clinique, etc.)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                  {currentClient ? 'Enregistrer' : 'Ajouter le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
