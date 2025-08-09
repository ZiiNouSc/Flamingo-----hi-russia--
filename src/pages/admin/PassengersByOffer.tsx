import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '../../components/common/PageHeader';

const PassengersByOffer: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/offers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setOffers(data));
  }, []);

  useEffect(() => {
    if (!selectedOffer) return;
    setLoading(true);
    fetch(`/api/offers/${selectedOffer}/reservations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        // On ne garde que les réservations payées
        const confirmed = data.filter((r: any) => r.status === 'paid');
        // On aplatit tous les passagers avec leur agence
        const allPassengers = confirmed.flatMap((r: any) =>
          (r.clients || r.passengers || []).map((p: any) => ({
            ...p,
            agency: r.agency?.agencyName || r.agency?.name || '-',
            reservationId: r._id,
            departDate: r.departDateSelected,
            returnDate: r.returnDateSelected,
          }))
        );
        setPassengers(allPassengers);
        setLoading(false);
      });
  }, [selectedOffer]);

  return (
    <div>
      <PageHeader title="Passagers par offre" subtitle="Consultez la liste des passagers confirmés pour chaque offre, avec leur agence et leurs détails." />
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Sélectionner une offre</label>
        <select className="input w-full max-w-md" value={selectedOffer} onChange={e => setSelectedOffer(e.target.value)}>
          <option value="">-- Choisir une offre --</option>
          {offers.map((offer: any) => (
            <option key={offer._id} value={offer._id}>{offer.title}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : selectedOffer && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4 font-semibold">Nombre total de passagers : {passengers.length}</div>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Date de naissance</th>
                <th>Type de chambre</th>
                <th>Agence</th>
                <th>Date départ</th>
                <th>Date retour</th>
              </tr>
            </thead>
            <tbody>
              {passengers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucun passager confirmé pour cette offre.</td></tr>
              ) : passengers.map((p: any, i: number) => (
                <tr key={i} className="border-b">
                  <td>{p.fullName || p.name}</td>
                  <td>{p.birthDate || p.birthdate}</td>
                  <td>{p.roomTypeSelected || '-'}</td>
                  <td>{p.agency}</td>
                  <td>{p.departDate ? format(new Date(p.departDate), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
                  <td>{p.returnDate ? format(new Date(p.returnDate), 'dd/MM/yyyy', { locale: fr }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PassengersByOffer; 