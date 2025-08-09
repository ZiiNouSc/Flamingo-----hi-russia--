import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type PaymentAPI = {
  _id: string;
  reservation: { _id: string; clientName?: string } | null;
  clientName?: string;
  amount: number;
  status: string;
};

const AdminPaymentList: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [method, setMethod] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let url = '/api/payments?';
    if (status) url += `status=${status}&`;
    if (method) url += `method=${method}&`;
    // TODO: ajouter type et recherche si backend supporte
    fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      });
  }, [status, method]);

  const handleValidate = async (id: string) => {
    await fetch(`/api/payments/${id}/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status: 'approved' }),
    });
    setPayments(payments.map((p: any) => p._id === id ? { ...p, status: 'approved' } : p));
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/payments/${id}/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status: 'rejected' }),
    });
    setPayments(payments.map((p: any) => p._id === id ? { ...p, status: 'rejected' } : p));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    await fetch(`/api/payments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setPayments(payments.filter((p: any) => p._id !== id));
  };

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div>
      <PageHeader
        title="Historique global des paiements"
        subtitle="Validez, refusez ou supprimez les paiements. Filtrez, recherchez et consultez tous les détails."
      />
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Statut</label>
          <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="approved">Validé</option>
            <option value="rejected">Refusé</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Méthode</label>
          <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="">Toutes</option>
            <option value="cash">Espèces</option>
            <option value="bank">Virement</option>
            <option value="card">Carte</option>
          </select>
        </div>
        {/* Recherche, type, etc. à ajouter si besoin */}
      </div>
      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Réservation</th>
                <th>Agence</th>
                <th>Offre</th>
                <th>Type</th>
                <th>Méthode</th>
                <th>Montant</th>
                <th>Commentaire</th>
                <th>Justificatif</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p._id} className="border-b">
                  <td>{p.reservation?._id || '-'}</td>
                  <td>{p.reservation?.agency?.agencyName || p.reservation?.agency?.name || '-'}</td>
                  <td>{p.reservation?.offer?.title || '-'}</td>
                  <td>{p.type}</td>
                  <td>{p.method}</td>
                  <td>{p.amount} DA</td>
                  <td>{p.comment || '-'}</td>
                  <td>{p.proofUrl ? <a href={p.proofUrl.startsWith('/uploads') ? backendUrl + p.proofUrl : p.proofUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Voir</a> : '-'}</td>
                  <td><span className={`badge ${p.status === 'approved' ? 'badge-success' : p.status === 'pending' ? 'badge-info' : 'badge-error'}`}>{p.status === 'approved' ? 'Validé' : p.status === 'pending' ? 'En attente' : 'Refusé'}</span></td>
                  <td>{p.createdAt ? format(new Date(p.createdAt), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
                  <td className="text-right space-x-2">
                    {p.status !== 'approved' && p.status !== 'rejected' && (
                      <>
                        <button onClick={() => handleValidate(p._id)} className="btn-primary btn-xs">Valider</button>
                        <button onClick={() => handleReject(p._id)} className="btn-outline btn-xs text-orange-500">Refuser</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(p._id)} className="btn-outline btn-xs text-red-500">Supprimer</button>
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

export default AdminPaymentList; 