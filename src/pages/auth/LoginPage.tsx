import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Redirect based on role
        if (isAdmin) {
          navigate('/admin/offers');
        } else {
          navigate('/agency/offers');
        }
      } else {
        setError('Identifiants invalides. Essayez "admin@flamingo.com" ou "agency@travel.com"');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg animate-slide-up">
        <div className="text-center">
          <div className="flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-flamingo-500">
              <path d="M8 17.0001C7 17.0001 5 17.5001 5 14.5001C5 11.9998 6 8.99935 7 7.99935C8.5 6.5 11 6.5 13 7.5C15 8.5 14 10.9999 14 12.4999C14 13.9999 13 18.5002 8 17.0001Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.9998 7.5C13.9998 7.5 13.4998 9.5 13.9998 12" stroke="#D91B45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 18V20" stroke="#D91B45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 19C16 19 16.5 17 14.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 17C18 17 19 15.5 17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900">
            Connexion à Flamingo
          </h2>
          <p className="mt-2 text-sm text-navy-600">
            Votre plateforme B2B de gestion de voyages
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="label">
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="label">
                Mot de passe
              </label>
              <div className="text-sm">
                <a href="#" className="text-flamingo-600 hover:text-flamingo-500">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2\" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <LogIn size={20} className="mr-2" />
              )}
              Se connecter
            </button>
          </div>
          
          <div className="text-center text-sm text-navy-500">
        
            <div className="mt-1 flex justify-center space-x-6">


            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;