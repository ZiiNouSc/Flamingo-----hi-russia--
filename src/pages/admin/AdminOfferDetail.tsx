import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, MapPin, Users, Star, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminOfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then(res => res.json())
      .then(data => {
        setOffer(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch(`/api/offers/${id}/reservations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setReservations(data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    await fetch(`/api/offers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    navigate('/admin/offers');
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return format(date, 'd MMMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!offer) return <div>Offre non trouvée</div>;

  return (
    <div>
      <PageHeader title={offer.title} showBackButton />
      <div className="flex justify-end mb-4 gap-2">
        <Link to={`/admin/offers/${offer._id}/edit`} className="btn-outline flex items-center"><Edit size={16} className="mr-1" />Éditer</Link>
        <button onClick={handleDelete} className="btn-outline text-red-500 flex items-center"><Trash2 size={16} className="mr-1" />Supprimer</button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="h-64 w-full overflow-hidden">
          <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center text-navy-600 mb-2 md:mb-0">
              <MapPin size={18} className="mr-1 text-flamingo-500" />
              <span>{offer.country} - {offer.cities.join(', ')}</span>
            </div>
            <div className="flex items-center text-navy-600">
              <CalendarIcon size={18} className="mr-1 text-flamingo-500" />
              <span>Dates disponibles : {offer.departDates?.length || 0}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-navy-600">
              <Users size={16} className="mr-1 text-flamingo-500" />
              <span>{offer.availableSeats}/{offer.totalSeats} disponibles</span>
            </div>
            <div className="flex items-center text-navy-600">
              <Star size={16} className="mr-1 text-flamingo-500" />
              <span>
                {offer.hotels && offer.hotels.length > 0 ? (offer.hotels.map((h: { stars: number }) => h.stars).reduce((a: number, b: number) => a + b, 0) / offer.hotels.length) : 0} Étoiles
              </span>
            </div>
          </div>
          <p className="text-navy-700 mb-6">{offer.description}</p>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Hôtels</h3>
            <div className="space-y-2">
              {offer.hotels && offer.hotels.map((hotel: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">{hotel.name}</span>
                  <div className="flex">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Star key={i} size={16} className="text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Programme journalier</h3>
            <ol className="list-decimal ml-6">
              {offer.dailyProgram && offer.dailyProgram.map((day: any, idx: number) => (
                <li key={idx} className="mb-2"><b>Jour {day.day} :</b> {day.content}</li>
              ))}
            </ol>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Inclusions</h3>
            <ul className="list-disc ml-6">
              {offer.inclusions && offer.inclusions.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Exclusions</h3>
            <ul className="list-disc ml-6">
              {offer.exclusions && offer.exclusions.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Dates de départ disponibles</h3>
            <div className="space-y-2">
              {offer.departDates?.map((date: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium">{date.label}</span>
                  <div className="text-navy-600">
                    {formatDate(date.date)} - {formatDate(date.dateRetour)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Réservations pour cette offre</h3>
        {reservations.length === 0 ? (
          <div className="text-gray-500">Aucune réservation pour cette offre.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Agence</th>
                <th>Date départ</th>
                <th>Date retour</th>
                <th>Statut</th>
                <th>Montant payé</th>
                <th>Reste à payer</th>
                <th>Passagers</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r._id} className="border-b">
                  <td>{r.agency?.agencyName || r.agency?.name || '-'}</td>
                  <td>{r.departDateSelected || '-'}</td>
                  <td>{r.returnDateSelected || '-'}</td>
                  <td>{r.status}</td>
                  <td>{r.montantPayé ?? r.amountPaid ?? 0} DA</td>
                  <td>{r.resteAPayer ?? r.amountRemaining ?? 0} DA</td>
                  <td>
                    <ul>
                      {(r.clients || r.passengers || []).map((p: any, i: number) => (
                        <li key={i}>{p.fullName || p.name} ({p.birthDate || p.birthdate}) {p.roomTypeSelected && `- ${p.roomTypeSelected}`}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOfferDetail;