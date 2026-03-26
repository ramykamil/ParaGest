import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, LogIn, UserPlus, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        console.log('Attempting signup for:', email);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log('Signup response:', { data, error: signUpError });

        if (signUpError) throw signUpError;

        // Create profile entry
        if (data.user) {
          const { error: profileError } = await supabase.from('profils').insert([{
            id: data.user.id,
            nom: nom || email.split('@')[0],
            role: 'Personnel',
          }]);
          if (profileError) console.warn('Profile insert error (may be expected):', profileError);
        }

        // If email confirmation is required, show success message
        if (data.user && !data.session) {
          setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription, ou désactivez la confirmation email dans Supabase (voir ci-dessous).");
        } else if (data.session) {
          setSuccess("Compte créé avec succès ! Redirection...");
        }

      } else {
        console.log('Attempting login for:', email);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Login response:', { data, error: signInError });
        if (signInError) throw signInError;
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Activity className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Para<span className="text-primary">Gest</span>
          </h1>
          <p className="text-gray-500 mt-2">Gestion de Magasin Paramédical</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p>{success}</p>
                {success.includes('email') && (
                  <p className="mt-2 text-xs text-green-600">
                    💡 Pour désactiver la confirmation: Supabase → Authentication → Providers → Email → Décochez "Confirm email"
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nom complet</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Chargement...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {isSignUp ? "S'inscrire" : 'Se connecter'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
              className="text-primary hover:text-blue-700 text-sm font-medium transition-colors"
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : "Pas encore de compte ? S'inscrire"}
            </button>
          </div>
        </div>

        <div className="text-center mt-6 space-y-0.5">
          <p className="text-xs font-medium text-gray-500">Ramy Kamil Mecheri</p>
          <p className="text-[10px] text-gray-400">ramy.mecherim2@gmail.com · +213 664 975 983</p>
          <p className="text-[10px] text-gray-400">© 2026 ParaGest — Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}
