import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';

const AgencyAccount: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [tab, setTab] = useState<'general' | 'security' | 'agency'>('general');
  // Champs généraux
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [agencyName, setAgencyName] = useState(currentUser?.agencyName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  // Champs agence
  const [rc, setRc] = useState(currentUser?.rc || '');
  // Sécurité
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  // Feedback
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Sauvegarde profil général/infos agence
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch('/api/auth/agency/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, agencyName, address, rc, phone }),
    });
    if (res.ok) setSuccess('Profil mis à jour !');
    else setError("Erreur lors de la mise à jour du profil.");
  };

  // Changement de mot de passe
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!password || password !== password2) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    // On suppose que le backend vérifie l'ancien mot de passe si besoin
    const res = await fetch('/api/auth/agency/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setSuccess('Mot de passe modifié !');
    else setError("Erreur lors du changement de mot de passe.");
    setOldPassword(''); setPassword(''); setPassword2('');
  };

  return (
    <div>
      <PageHeader title="Mon profil agence" />
      <div className="flex flex-col md:flex-row gap-8">
        {/* Colonne gauche : résumé */}
        <div className="md:w-1/3 bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-flamingo-100 flex items-center justify-center text-flamingo-600 text-3xl font-bold mb-4">
            {name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="text-lg font-semibold text-navy-900 mb-1">{name}</div>
          <div className="text-sm text-navy-600 mb-1">{email}</div>
          <div className="text-sm text-navy-600 mb-1">{agencyName}</div>
          <div className="text-sm text-navy-500 mb-1">{phone}</div>
          <div className="text-xs text-navy-400 mb-4">RC : {rc || '-'}</div>
          <div className="flex flex-col gap-2 w-full mt-4">
            <button onClick={() => setTab('general')} className={`btn-outline w-full ${tab==='general' && 'border-flamingo-500 text-flamingo-600'}`}>Général</button>
            <button onClick={() => setTab('agency')} className={`btn-outline w-full ${tab==='agency' && 'border-flamingo-500 text-flamingo-600'}`}>Infos agence</button>
            <button onClick={() => setTab('security')} className={`btn-outline w-full ${tab==='security' && 'border-flamingo-500 text-flamingo-600'}`}>Sécurité</button>
          </div>
        </div>
        {/* Colonne droite : tabs */}
        <div className="md:w-2/3 bg-white rounded-lg shadow-md p-6">
          {success && <div className="text-green-600 mb-2">{success}</div>}
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {tab === 'general' && (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="label">Nom</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Nom de l'agence</label>
                <input className="input" value={agencyName} onChange={e => setAgencyName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="label">Adresse</label>
                <input className="input" value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full">Enregistrer</button>
            </form>
          )}
          {tab === 'agency' && (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="label">N° RC</label>
                <input className="input" value={rc} onChange={e => setRc(e.target.value)} required />
              </div>
              <div>
                <label className="label">Adresse</label>
                <input className="input" value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full">Enregistrer</button>
            </form>
          )}
          {tab === 'security' && (
            <form onSubmit={handlePasswordSave} className="space-y-4">
              {/* <div>
                <label className="label">Ancien mot de passe</label>
                <input className="input" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div> */}
              <div>
                <label className="label">Nouveau mot de passe</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className="label">Confirmer le mot de passe</label>
                <input className="input" type="password" value={password2} onChange={e => setPassword2(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full">Changer le mot de passe</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyAccount; 