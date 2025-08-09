import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  approved: 'Validée',
  rejected: 'Rejetée',
  'pending_payment': 'En attente paiement',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  'pending_payment': 'bg-orange-100 text-orange-800',
};

const AdminReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tab, setTab] = useState<'all' | 'paid' | 'unpaid' | 'pending' | 'rejected'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [validateModal, setValidateModal] = useState<{ open: boolean, id: string | null, total: number }>({ open: false, id: null, total: 0 });
  const [validateType, setValidateType] = useState<'total' | 'acompte'>('total');
  const [validateMontant, setValidateMontant] = useState<number>(0);
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateError, setValidateError] = useState('');

  useEffect(() => {
    fetch('/api/reservations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let data = [...reservations];
    // Filtrage par onglet
    if (tab === 'paid') data = data.filter(r => r.status === 'paid');
    if (tab === 'unpaid') data = data.filter(r => r.status !== 'paid');
    if (tab === 'pending') data = data.filter(r => r.status === 'pending' || r.status === 'pending_payment');
    if (tab === 'rejected') data = data.filter(r => r.status === 'rejected');
    if (status) data = data.filter(r => r.status === status);
    if (search) {
      data = data.filter(r =>
        (r.offerTitle || r.offer?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.clientName || r.agency?.agencyName || r.agency?.name || '').toLowerCase().includes(search.toLowerCase())
      );
    }
    if (dateFrom) data = data.filter(r => r.createdAt && r.createdAt >= dateFrom);
    if (dateTo) data = data.filter(r => r.createdAt && r.createdAt <= dateTo);
    setFiltered(data);
  }, [reservations, status, search, dateFrom, dateTo, tab]);

  // Reporting
  const total = reservations.length;
  const paid = reservations.filter(r => r.status === 'paid').length;
  const pending = reservations.filter(r => r.status === 'pending' || r.status === 'pending_payment').length;
  const rejected = reservations.filter(r => r.status === 'rejected').length;

  const openValidate = (id: string, total: number) => {
    setValidateType('total');
    setValidateMontant(total);
    setValidateModal({ open: true, id, total });
    setValidateError('');
  };
  const closeValidate = () => {
    setValidateModal({ open: false, id: null, total: 0 });
    setValidateError('');
  };

  const handleValidate = async (id: string, total: number) => {
    openValidate(id, total);
  };

  const handleValidateConfirm = async () => {
    if (!validateModal.id) return;
    setValidateLoading(true);
    setValidateError('');
    try {
      const res = await fetch(`/api/reservations/${validateModal.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          type: validateType === 'total' ? 'total' : 'acompte',
          montant: validateMontant,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReservations(reservations.map((r: any) => r._id === updated._id ? updated : r));
        closeValidate();
        toast.success('Réservation validée avec succès.');
      } else {
        const err = await res.json().catch(() => null);
        setValidateError(err?.message || 'Erreur lors de la validation.');
        toast.error(err?.message || 'Erreur lors de la validation.');
      }
    } catch (err) {
      setValidateError('Erreur lors de la validation.');
      toast.error('Erreur lors de la validation.');
    } finally {
      setValidateLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/reservations/${id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setReservations(reservations.map((r: any) => r._id === id ? { ...r, status: 'rejected' } : r));
    toast.success('Réservation refusée.');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette réservation ?')) return;
    await fetch(`/api/reservations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setReservations(reservations.filter((r: any) => r._id !== id));
    toast.success('Réservation supprimée.');
  };

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div>
      <PageHeader
        title="Gestion des réservations"
        subtitle="Validez, refusez ou supprimez les réservations des agences. Filtrez, recherchez et consultez les détails des passagers."
      />
      {/* Onglets de filtrage */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('all')}>Toutes</button>
        <button className={`btn ${tab === 'paid' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('paid')}>Payées</button>
        <button className={`btn ${tab === 'unpaid' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('unpaid')}>Non payées</button>
        <button className={`btn ${tab === 'pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('pending')}>En attente</button>
        <button className={`btn ${tab === 'rejected' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('rejected')}>Rejetées</button>
      </div>
      {/* Reporting */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-gray-500 text-sm">Total</div>
        </div>
        <div className="bg-green-50 rounded shadow p-4 text-center">
          <div className="text-2xl font-bold">{paid}</div>
          <div className="text-green-700 text-sm">Payées</div>
        </div>
        <div className="bg-yellow-50 rounded shadow p-4 text-center">
          <div className="text-2xl font-bold">{pending}</div>
          <div className="text-yellow-700 text-sm">En attente</div>
        </div>
        <div className="bg-red-50 rounded shadow p-4 text-center">
          <div className="text-2xl font-bold">{rejected}</div>
          <div className="text-red-700 text-sm">Rejetées</div>
        </div>
      </div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Statut</label>
          <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="paid">Payée</option>
            <option value="rejected">Rejetée</option>
            <option value="pending_payment">En attente paiement</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Recherche</label>
          <input className="input" placeholder="Client, offre ou agence..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Du</label>
          <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Au</label>
          <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button className="btn-outline btn-xs h-10" onClick={() => { setStatus(''); setSearch(''); setDateFrom(''); setDateTo(''); }}>Réinitialiser</button>
      </div>
      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Offre</th>
              <th className="px-4 py-2">Agence</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Montant payé</th>
              <th className="px-4 py-2">Reste à payer</th>
              <th className="px-4 py-2">Actions</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Aucune réservation trouvée.</td></tr>
            ) : filtered.map((r: any) => (
              <>
                <tr key={r._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{r.offerTitle || r.offer?.title || '-'}</td>
                  <td className="px-4 py-2">{r.agency?.agencyName || r.agency?.name || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABELS[r.status] || r.status}</span>
                  </td>
                  <td className="px-4 py-2">{r.createdAt ? format(new Date(r.createdAt), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
                  <td className="px-4 py-2">{r.montantPayé ?? r.amountPaid ?? 0} DA</td>
                  <td className="px-4 py-2">{r.resteAPayer ?? r.amountRemaining ?? 0} DA</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Link to={`/admin/reservations/${r._id}`} className="btn-outline btn-xs">Voir</Link>
                    {r.status !== 'paid' && r.status !== 'rejected' && (
                      <button onClick={() => handleValidate(r._id, r.totalPrice)} className="btn-primary btn-xs">Valider</button>
                    )}
                    {r.status !== 'rejected' && (
                      <button onClick={() => handleReject(r._id)} className="btn-outline btn-xs text-orange-500">Refuser</button>
                    )}
                    <button onClick={() => handleDelete(r._id)} className="btn-outline btn-xs text-red-500">Supprimer</button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => toggleExpand(r._id)} className="btn-outline btn-xs">
                      {expanded === r._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Passagers
                    </button>
                  </td>
                </tr>
                {expanded === r._id && (
                  <tr>
                    <td colSpan={8} className="bg-gray-50 px-4 py-2">
                      <div className="font-semibold mb-2">Détails des passagers</div>
                      <ul className="list-disc ml-6">
                        {(r.clients || r.passengers || []).map((p: any, i: number) => (
                          <li key={i} className="mb-1">
                            {p.fullName || p.name} — {p.birthDate || p.birthdate} {p.roomTypeSelected && `— ${p.roomTypeSelected}`}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal de validation */}
      {validateModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Valider la réservation</h3>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Type de paiement</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="type" checked={validateType === 'total'} onChange={() => { setValidateType('total'); setValidateMontant(validateModal.total); }} />
                  Paiement total ({validateModal.total} DA)
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="type" checked={validateType === 'acompte'} onChange={() => { setValidateType('acompte'); setValidateMontant(0); }} />
                  Versement/acompte
                </label>
              </div>
            </div>
            {validateType === 'acompte' && (
              <div className="mb-4">
                <label className="block mb-2 font-medium">Montant du versement</label>
                <input type="number" className="input w-full" min={1} max={validateModal.total} value={validateMontant} onChange={e => setValidateMontant(Number(e.target.value))} />
              </div>
            )}
            {validateError && <div className="text-red-500 mb-2">{validateError}</div>}
            <div className="flex gap-4 justify-end">
              <button className="btn-outline" onClick={closeValidate} disabled={validateLoading}>Annuler</button>
              <button className="btn-primary" onClick={handleValidateConfirm} disabled={validateLoading || (validateType === 'acompte' && (!validateMontant || validateMontant <= 0))}>
                {validateLoading ? 'Validation...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationList; 