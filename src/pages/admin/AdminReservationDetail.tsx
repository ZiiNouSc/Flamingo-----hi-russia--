import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const AdminReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [montantPaye, setMontantPaye] = useState<number | ''>('');
  const [resteAPayer, setResteAPayer] = useState<number>(0);
  const [success, setSuccess] = useState('');

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`/api/reservations/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setReservation(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (reservation) {
      setMontantPaye(reservation.montantPayé ?? reservation.amountPaid ?? 0);
      setResteAPayer((reservation.totalPrice ?? 0) - (reservation.montantPayé ?? reservation.amountPaid ?? 0));
    }
  }, [reservation]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: fr });
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/reservations/${id}/validate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const updated = await res.json();
        setReservation(updated);
        setSuccess('Réservation validée avec succès.');
        toast.success('Réservation validée avec succès.');
      } else {
        const err = await res.json().catch(() => null);
        setError(err?.message || "Erreur lors de la validation.");
        toast.error(err?.message || "Erreur lors de la validation.");
      }
    } catch (err) {
      setError("Erreur lors de la validation.");
      toast.error("Erreur lors de la validation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const updated = await res.json();
        setReservation(updated);
        toast.success('Réservation refusée.');
      } else {
        setError("Erreur lors du refus.");
        toast.error("Erreur lors du refus.");
      }
    } catch (err) {
      setError("Erreur lors du refus.");
      toast.error("Erreur lors du refus.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${id}/reactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setReservation(updated);
        setSuccess('Réservation remise en attente.');
        toast.success('Réservation remise en attente.');
      } else {
        setError("Erreur lors de la réactivation.");
        toast.error("Erreur lors de la réactivation.");
      }
    } catch (err) {
      setError("Erreur lors de la réactivation.");
      toast.error("Erreur lors de la réactivation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMontantPayeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setMontantPaye(value);
    setResteAPayer((reservation.totalPrice ?? 0) - (value === '' ? 0 : value));
  };

  const handleSaveMontantPaye = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ montantPayé: montantPaye, resteAPayer: (reservation.totalPrice ?? 0) - (montantPaye === '' ? 0 : montantPaye) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReservation(updated);
      } else {
        setError("Erreur lors de la mise à jour du montant payé.");
      }
    } catch (err) {
      setError("Erreur lors de la mise à jour du montant payé.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!reservation) return <div>Réservation introuvable</div>;

  const offer = reservation.offer || {};
  const proofUrl = reservation.paymentProof?.startsWith('/uploads')
    ? backendUrl + reservation.paymentProof
    : reservation.paymentProof;

  return (
    <div>
      <PageHeader title={`Détail réservation agence`} showBackButton />
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{offer.title}</h2>
        <div className="mb-2 text-navy-700">Agence : {reservation.agency?.name || '-'}</div>
        <div className="mb-2 text-navy-700">Date de réservation : {formatDate(reservation.createdAt)}</div>
        <div className="mb-2 text-navy-700">Statut : <span className={`badge ${reservation.status === 'paid' ? 'badge-success' : reservation.status === 'partial_paid' ? 'badge-warning' : reservation.status === 'pending' ? 'badge-info' : reservation.status === 'rejected' ? 'badge-error' : 'badge-navy'}`}>{reservation.status === 'paid' ? 'Payée' : reservation.status === 'partial_paid' ? 'Acompte versé' : reservation.status === 'pending' ? 'En attente' : reservation.status === 'rejected' ? 'Rejetée' : reservation.status}</span></div>
        <div className="mb-2 text-navy-700">Prix total : {reservation.totalPrice} DA</div>
        <div className="mb-2 text-navy-700">Montant payé : <b>{reservation.montantPayé || 0} DA</b></div>
        <div className="mb-2 text-navy-700">Reste à payer : <b>{reservation.resteAPayer || 0} DA</b></div>
        <div className="mb-2 text-navy-700">Passagers : {reservation.passengers?.length || 0}</div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Historique des paiements</h3>
        {reservation.payments && reservation.payments.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Justificatif</th>
              </tr>
            </thead>
            <tbody>
              {reservation.payments.map((p: any, i: number) => (
                <tr key={p._id || i} className="border-b">
                  <td>{p.type}</td>
                  <td>{p.amount} DA</td>
                  <td>{p.method}</td>
                  <td><span className={`badge ${p.status === 'approved' ? 'badge-success' : p.status === 'pending' ? 'badge-info' : 'badge-error'}`}>{p.status === 'approved' ? 'Validé' : p.status === 'pending' ? 'En attente' : 'Refusé'}</span></td>
                  <td>{formatDate(p.createdAt)}</td>
                  <td>{p.proofUrl ? <a href={p.proofUrl.startsWith('/uploads') ? backendUrl + p.proofUrl : p.proofUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Voir</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="text-navy-600">Aucun paiement enregistré.</div>}
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Preuve de paiement</h3>
        {reservation.paymentProof ? (
          <div>
            <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Voir / Télécharger la preuve</a>
          </div>
        ) : (
          <span className="text-navy-600">Aucune preuve envoyée.</span>
        )}
      </div>
      {success && <div className="text-green-600 mb-4">{success}</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex gap-4">
        {reservation.status !== 'paid' && reservation.status !== 'rejected' && (
          <>
            <button onClick={handleApprove} className="btn-primary" disabled={actionLoading}>Valider la réservation</button>
            <button onClick={handleReject} className="btn-outline text-red-600" disabled={actionLoading}>Refuser</button>
          </>
        )}
        {reservation.status === 'rejected' && (
          <button onClick={handleReactivate} className="btn-primary" disabled={actionLoading}>Remettre en attente</button>
        )}
        <button onClick={() => navigate(-1)} className="btn-outline">Retour</button>
      </div>
    </div>
  );
};

export default AdminReservationDetail; 