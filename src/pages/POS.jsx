import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Building, Printer, X, CheckCircle } from 'lucide-react';

export default function POS() {
  const [produits, setProduits] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null); // Receipt modal state

  useEffect(() => {
    fetchProduits();
  }, [search]);

  const fetchProduits = async () => {
    let query = supabase.from('produits').select('*').gt('stock_actuel', 0).order('nom');
    if (search) query = query.ilike('nom', `%${search}%`);
    const { data } = await query;
    setProduits(data || []);
  };

  const addToCart = (produit) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === produit.id);
      if (existing) {
        if (existing.quantite >= produit.stock_actuel) return prev;
        return prev.map(item => item.id === produit.id ? { ...item, quantite: item.quantite + 1 } : item);
      }
      return [...prev, { ...produit, quantite: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantite + delta;
        if (newQ > item.stock_actuel || newQ < 1) return item;
        return { ...item, quantite: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const total = cart.reduce((sum, item) => sum + (item.prix_vente * item.quantite), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const { data: venteData, error: venteError } = await supabase
        .from('ventes')
        .insert([{ total, methode_paiement: paymentMethod }])
        .select()
        .single();

      if (venteError) throw venteError;

      const lignes = cart.map(item => ({
        vente_id: venteData.id,
        produit_id: item.id,
        quantite: item.quantite,
        prix_unitaire: item.prix_vente
      }));

      const { error: ligneError } = await supabase.from('ligne_ventes').insert(lignes);
      if (ligneError) throw ligneError;

      // Show receipt modal instead of alert
      setReceipt({
        id: venteData.id,
        date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total,
        methode: paymentMethod,
      });

      setCart([]);
      fetchProduits();
    } catch (error) {
      console.error("Erreur Checkout:", error);
      alert("Une erreur est survenue lors de l'enregistrement de la vente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Left Pane: Products */}
      <div className="flex-1 flex flex-col space-y-4 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900">Point de Vente</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Rechercher un produit (en stock)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[500px]">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {produits.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="flex-1">
                  <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                    {p.categorie || 'Général'}
                  </span>
                  <h3 className="font-bold text-gray-800 leading-tight mb-2">{p.nom}</h3>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Stock: {p.stock_actuel}</p>
                    <p className="font-bold text-lg text-primary">{p.prix_vente} DZD</p>
                  </div>
                  <button className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {produits.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                Aucun produit en stock trouvé.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: Cart */}
      <div className="w-full md:w-96 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-6rem)] relative print:hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2 text-primary" />
            Panier
          </h2>
          <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-sm font-semibold">
            {cart.length} art.
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Le panier est vide</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-gray-800 text-sm">{item.nom}</h4>
                  <p className="text-primary font-medium text-sm mt-1">{item.prix_vente} DZD</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-600 hover:text-gray-900 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm bg-transparent">{item.quantite}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-600 hover:text-gray-900 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-danger hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-100 mt-auto rounded-b-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Méthode</span>
            <div className="flex space-x-2">
              <button onClick={() => setPaymentMethod('Espèces')} className={`p-2 rounded-lg flex items-center transition-colors ${paymentMethod === 'Espèces' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`} title="Espèces">
                <Banknote className="w-5 h-5" />
              </button>
              <button onClick={() => setPaymentMethod('Carte')} className={`p-2 rounded-lg flex items-center transition-colors ${paymentMethod === 'Carte' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`} title="Carte bancaire">
                <CreditCard className="w-5 h-5" />
              </button>
              <button onClick={() => setPaymentMethod('Virement')} className={`p-2 rounded-lg flex items-center transition-colors ${paymentMethod === 'Virement' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`} title="Virement">
                <Building className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6 py-3 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-black text-primary">{total.toFixed(2)} DZD</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all ${
              cart.length === 0 || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-success hover:bg-green-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {isProcessing ? 'Enregistrement...' : 'Enregistrer la vente'}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden print:shadow-none print:rounded-none print:max-w-full">
            {/* Receipt Header */}
            <div className="bg-success text-white p-6 text-center print:bg-white print:text-black print:border-b-2 print:border-black">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 print:hidden" />
              <h2 className="text-2xl font-bold">Vente enregistrée !</h2>
              <p className="text-green-100 text-sm mt-1 print:text-gray-600">Reçu de transaction</p>
            </div>
            
            {/* Receipt Body */}
            <div className="p-6 space-y-4">
              <div className="text-center border-b border-dashed border-gray-300 pb-4">
                <h3 className="text-lg font-bold text-gray-900">ParaGest</h3>
                <p className="text-xs text-gray-500">Magasin Paramédical</p>
                <p className="text-xs text-gray-400 mt-1">{receipt.date}</p>
                <p className="text-xs text-gray-400 font-mono">Réf: {receipt.id.split('-')[0]}</p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="text-gray-800">{item.nom}</span>
                      <span className="text-gray-400 ml-2">x{item.quantite}</span>
                    </div>
                    <span className="font-medium text-gray-900">{(item.prix_vente * item.quantite).toFixed(2)} DZD</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-dashed border-gray-300 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-black text-primary">{receipt.total.toFixed(2)} DZD</span>
              </div>

              <div className="text-center text-xs text-gray-500 border-t border-dashed border-gray-300 pt-3">
                Payé par: <span className="font-medium">{receipt.methode}</span>
              </div>

              <p className="text-center text-xs text-gray-400 mt-2">Merci pour votre achat !</p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex space-x-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                Imprimer
              </button>
              <button
                onClick={() => setReceipt(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 mr-2" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
