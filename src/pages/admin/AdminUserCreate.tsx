import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const AdminUserCreate: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('agency');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ name, email, password, role, agencyName }),
    });
    if (res.ok) {
      alert('Utilisateur créé avec succès !');
      navigate('/admin/users');
    } else {
      const err = await res.json().catch(() => null);
      setError(err?.message || 'Erreur lors de la création.');
    }
  };

  return (
    <div>
      <PageHeader title="Créer un utilisateur" showBackButton />
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto mt-6 space-y-4">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div>
          <label className="label">Nom</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="label">Rôle</label>
          <select className="select" value={role} onChange={e => setRole(e.target.value)} required>
            <option value="admin">Admin</option>
            <option value="agency">Agence</option>
          </select>
        </div>
        {role === 'agency' && (
          <div>
            <label className="label">Nom de l'agence</label>
            <input className="input" value={agencyName} onChange={e => setAgencyName(e.target.value)} required={role === 'agency'} />
          </div>
        )}
        <button type="submit" className="btn-primary w-full">Créer</button>
      </form>
    </div>
  );
};

export default AdminUserCreate; 