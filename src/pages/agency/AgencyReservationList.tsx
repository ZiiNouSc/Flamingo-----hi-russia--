import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ExternalLink, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { fr } from 'date-fns/locale';

const AgencyReservationList: React.FC = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reservations', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        // Filtrer les réservations de l'agence connectée
        setReservations(data.filter((r: any) => r.agency && (r.agency._id === currentUser?.id || r.agency.id === currentUser?.id)));
        setLoading(false);
      });
  }, [currentUser]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'approved':
        return 'badge-success';
      case 'pending_payment':
        return 'badge-info';
      case 'rejected':
        return 'badge-error';
      case 'paid':
        return 'badge-teal';
      default:
        return 'badge-navy';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'pending_payment':
        return 'En cours d\'examen';
      case 'rejected':
        return 'Rejetée';
      case 'paid':
        return 'Payée';
      default:
        return status;
    }
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

  const handleCancel = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
    await fetch(`/api/reservations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setReservations(reservations.filter(r => r._id !== id));
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <PageHeader 
        title="Mes réservations" 
        subtitle="Suivez et gérez vos réservations de voyage"
      />
      {reservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-navy-900 mb-2">Aucune réservation</h3>
          <p className="text-navy-600 mb-4">
            Vous n'avez pas encore effectué de réservation. Parcourez les offres pour réserver.
          </p>
          <Link to="/agency/offers" className="btn-primary">
            Parcourir les offres
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reservations.map(reservation => {
            // Remplace getOfferById par une recherche dans les offres si besoin
            const offer = reservation.offer || {};
            return (
              <div key={reservation._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Offer Details */}
                  <div className="md:w-1/3">
                    <h3 className="text-lg font-semibold mb-2">{offer.title}</h3>
                    <div className="flex items-center text-navy-600 mb-2">
                      <Calendar size={16} className="mr-1 text-flamingo-500" />
                      <span className="text-sm">
                        {offer && `${formatDate(offer.departureDate)} - ${formatDate(offer.returnDate)}`}
                      </span>
                    </div>
                    <div className="flex items-center text-navy-600 mb-3">
                      <Users size={16} className="mr-1 text-flamingo-500" />
                      <span className="text-sm">
                        {reservation.passengers?.length || 0} Passagers
                      </span>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                  {/* Reservation Details */}
                  <div className="md:w-1/3">
                    <h4 className="font-medium text-navy-800 mb-2">Détails de la réservation</h4>
                    <div className="space-y-1 text-sm text-navy-600">
                      <div className="flex items-start">
                        <span className="font-medium w-32">Date de réservation :</span>
                        <span>{formatDate(reservation.createdAt)}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium w-32">Prix total :</span>
                        <span className="font-semibold text-flamingo-600">{reservation.totalPrice} DA</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium w-32">Passeports :</span>
                        <span>{reservation.passportFiles?.length || 0} fichiers</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium w-32">Preuve de paiement :</span>
                        <span>{reservation.paymentProof ? "Téléchargée" : "Non téléchargée"}</span>
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="md:w-1/3 flex flex-col justify-between">
                    <div className="flex items-center text-navy-600 mb-3">
                      <Clock size={16} className="mr-1 text-flamingo-500" />
                      <span className="text-sm">
                        Créée {formatDate(reservation.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-3 mt-4">
                      {(['pending', 'approved', 'pending_payment'].includes(reservation.status)) && (
                        <Link
                          to={`/agency/reservations/${reservation._id}#upload`}
                          className="btn-primary flex items-center justify-center"
                        >
                          Uploader un reçu
                        </Link>
                      )}
                      <Link
                        to={`/agency/reservations/${reservation._id}`}
                        className="btn-outline flex items-center justify-center"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        Voir détails
                      </Link>
                      {reservation.status === 'pending' && (
                        <button className="btn-outline flex items-center justify-center border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleCancel(reservation._id)}>
                          Annuler la réservation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgencyReservationList;