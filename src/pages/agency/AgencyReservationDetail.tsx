import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '../../components/common/PageHeader';
import { Calendar, Users, Clock, ArrowLeft, MapPin, Building, CreditCard } from 'lucide-react';
import FileUpload from '../../components/common/FileUpload';
import { UploadedFile } from '../../types';

const AgencyReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const uploadRef = useRef<HTMLDivElement>(null);

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
    if (window.location.hash === '#upload' && uploadRef.current) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [loading]);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return format(date, "d MMMM yyyy", { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

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

  const handlePaymentProofUpload = async (files: any[]) => {
    setError('');
    setUploading(true);
    try {
      // Cherche le vrai fichier natif (File)
      let file = null;
      if (files[0] instanceof File) {
        file = files[0];
      } else if (files[0]?.file instanceof File) {
        file = files[0].file;
      }
      if (!file) {
        setError("Merci de sélectionner un fichier valide.");
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('paymentProof', file);
      const res = await fetch(`/api/reservations/${id}/payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setReservation(updated);
      } else {
        setError("Erreur lors de l'envoi de la preuve de paiement.");
      }
    } catch (err) {
      setError("Erreur lors de l'envoi de la preuve de paiement.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!reservation) return <div>Réservation introuvable</div>;

  const offer = reservation.offer || {};

  const proofUrl = reservation.paymentProof?.startsWith('/uploads')
    ? backendUrl + reservation.paymentProof
    : reservation.paymentProof;

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Détail de la réservation" showBackButton />
      
      {/* En-tête avec statut */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{offer.title}</h2>
            <div className="flex items-center text-navy-600 mb-2">
              <MapPin size={16} className="mr-1 text-flamingo-500" />
              <span className="text-sm">{offer.country}, {offer.cities?.join(', ')}</span>
            </div>
          </div>
          <span className={`badge ${getStatusBadgeClass(reservation.status)}`}>
            {getStatusLabel(reservation.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails du voyage */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Détails du voyage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Date de départ</div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-flamingo-500" />
                  <span className="font-medium">{formatDate(reservation.departDateSelected)}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Date de retour</div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-flamingo-500" />
                  <span className="font-medium">{formatDate(offer.returnDate)}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Nombre de passagers</div>
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-flamingo-500" />
                  <span className="font-medium">{reservation.passengers?.length || 0} personnes</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Date de réservation</div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-flamingo-500" />
                  <span className="font-medium">{formatDate(reservation.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Détails des passagers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Passagers</h3>
            <div className="space-y-4">
              {reservation.passengers?.map((p: any, idx: number) => {
                const age = p.birthDate ? new Date().getFullYear() - new Date(p.birthDate).getFullYear() : null;
                const room = reservation.rooms?.find((r: any) => r.passengerId === p.id);
                return (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-lg">{p.firstName} {p.lastName}</div>
                        {age && <div className="text-sm text-gray-500">{age} ans</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Type de chambre</div>
                        <div className="font-medium">{room?.roomType || 'Non spécifié'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Numéro de passeport</div>
                        <div>{p.passportNumber}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Date d'expiration</div>
                        <div>{formatDate(p.passportExpiry)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Détail du prix */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Détail du prix</h3>
            <div className="space-y-2">
              {reservation.passengers?.map((p: any, idx: number) => {
                const room = reservation.rooms?.find((r: any) => r.passengerId === p.id);
                const roomType = offer.roomTypes?.find((rt: any) => rt.value === room?.roomType);
                const basePrice = p.calculatedPrice || 0;
                const roomPrice = roomType?.price || 0;
                const total = basePrice + roomPrice;
                
                return (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium">{p.firstName} {p.lastName}</div>
                      <div className="text-sm text-gray-500">
                        {roomType ? `Chambre ${roomType.label}` : 'Chambre non spécifiée'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{total} DA</div>
                      <div className="text-sm text-gray-500">
                        {basePrice} DA + {roomPrice} DA
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-4 mt-4 border-t">
                <div className="text-lg font-medium">Total</div>
                <div className="text-2xl font-bold text-flamingo-600">{reservation.totalPrice} DA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            
            {/* Statut du paiement */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={20} className="text-flamingo-500" />
                <span className="font-medium">Statut du paiement</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Montant total</span>
                  <span className="font-medium">{reservation.totalPrice} DA</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Montant payé</span>
                  <span className="font-medium">{reservation.montantPayé || 0} DA</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Reste à payer</span>
                  <span className="font-medium text-flamingo-600">{reservation.resteAPayer || reservation.totalPrice} DA</span>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              {reservation.status !== 'paid' && reservation.status !== 'rejected' && (
                <Link 
                  to={`/agency/payment/${reservation._id}`}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <CreditCard size={16} className="mr-2" />
                  Effectuer un paiement
                </Link>
              )}
              <Link 
                to="/agency/reservations"
                className="btn-outline w-full flex items-center justify-center"
              >
                <ArrowLeft size={16} className="mr-2" />
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyReservationDetail; 