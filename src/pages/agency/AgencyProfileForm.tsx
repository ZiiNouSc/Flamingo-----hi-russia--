import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';

const AgencyProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [rc, setRc] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { currentUser, token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/agency/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ address, rc, phone }),
    });
    if (res.ok) {
      alert('Profil agence enregistré ! En attente de validation par un administrateur.');
      navigate('/agency/approval');
    } else {
      const err = await res.json().catch(() => null);
      setError(err?.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <div>
      <PageHeader title="Compléter le profil de l'agence" />
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto mt-6 space-y-4">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div>
          <label className="label">Adresse</label>
          <input className="input" value={address} onChange={e => setAddress(e.target.value)} required />
        </div>
        <div>
          <label className="label">N° RC</label>
          <input className="input" value={rc} onChange={e => setRc(e.target.value)} required />
        </div>
        <div>
          <label className="label">Téléphone</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary w-full">Enregistrer</button>
      </form>
    </div>
  );
};

export default AgencyProfileForm; 