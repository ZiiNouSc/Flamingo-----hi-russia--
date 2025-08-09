import React, { useEffect, useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await fetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setUsers(users.filter((u: any) => u._id !== id));
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/auth/users/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setUsers(users.map((u: any) => u._id === id ? { ...u, isApproved: true } : u));
  };

  return (
    <div>
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Créez, modifiez ou supprimez les comptes utilisateurs"
        action={
          <Link to="/admin/users/new" className="btn-primary flex items-center">
            <Plus size={18} className="mr-1" />
            Ajouter un utilisateur
          </Link>
        }
      />
      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Agence</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user._id} className="border-b">
                  <td className="px-4 py-2 flex items-center"><User className="mr-2" />{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">{user.agencyName || '-'}</td>
                  <td className="px-4 py-2">{user.isApproved ? 'Validé' : 'En attente'}
                    {!user.isApproved && user.role === 'agency' && (
                      <button onClick={() => handleApprove(user._id)} className="ml-2 btn-xs btn-primary">Approuver</button>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserList; 