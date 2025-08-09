import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addMonths, isBefore, parseISO } from 'date-fns';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Offer } from '../../types';
import PageHeader from '../../components/common/PageHeader';

// Types de base (à affiner)
type Passenger = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  passportNumber: string;
  passportExpiry: string;
  isChild?: boolean;
  passportFile?: File | null;
};
type RoomChoice = {
  passengerId: string;
  roomType: string;
};

// Types de chambre disponibles (à adapter selon l'offre)
const roomTypes = [
  { label: 'Single', value: 'single', prix: 10000 },
  { label: 'Double', value: 'double', prix: 18000 },
  { label: 'Triple', value: 'triple', prix: 25000 },
];

const steps = [
  'Informations passagers',
  'Choix des chambres',
  'Récapitulatif',
];

const AgencyReservationWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [rooms, setRooms] = useState<RoomChoice[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (id) {
      fetch(`/api/offers/${id}`)
        .then(res => res.json())
        .then(data => {
          setOffer(data);
          setLoading(false);
          
          // Récupération de la date de départ depuis l'URL
          const selectedDate = searchParams.get('date');
          if (selectedDate) {
            setDepartureDate(selectedDate);
          }
          
          // Pré-remplir les passagers si le paramètre est présent
          const passengerCount = parseInt(searchParams.get('passengers') || '0');
          if (passengerCount > 0) {
            const initialPassengers = Array(passengerCount).fill(null).map(() => ({
              id: uuidv4(),
              firstName: '',
              lastName: '',
              birthDate: '',
              passportNumber: '',
              passportExpiry: '',
              isChild: false,
              passportFile: null,
            }));
            setPassengers(initialPassengers);
          }
        });
    }
  }, [id, searchParams]);

  if (loading) return <div>Chargement...</div>;
  if (!offer) return <div>Offre non trouvée</div>;

  // On récupère les vrais roomTypes et pricingRules de l'offre
  const roomTypes = offer?.roomTypes || [];
  const pricingRules = offer?.pricingRules || [];

  // Navigation
  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // Ajout d'un passager
  const addPassenger = () => {
    setPassengers(prev => ([
      ...prev,
      {
        id: uuidv4(),
        firstName: '',
        lastName: '',
        birthDate: '',
        passportNumber: '',
        passportExpiry: '',
        isChild: false,
        passportFile: null,
      },
    ]));
  };

  // Suppression d'un passager
  const removePassenger = (id: string) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
  };

  // Modification d'un champ passager
  const updatePassenger = (id: string, field: keyof Passenger, value: any) => {
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Validation de l'étape 1
  const validateStep1 = () => {
    if (!departureDate) {
      setFormError('Veuillez sélectionner une date de départ.');
      return false;
    }
    if (passengers.length === 0) {
      setFormError('Ajoutez au moins un passager.');
      return false;
    }
    const hasAdult = passengers.some(p => !p.isChild);
    if (!hasAdult) {
      setFormError('Il faut au moins un adulte.');
      return false;
    }
    for (const p of passengers) {
      if (!p.firstName || !p.lastName || !p.birthDate || !p.passportNumber || !p.passportExpiry) {
        setFormError('Tous les champs sont obligatoires pour chaque passager.');
        return false;
      }
      // Vérif passeport : doit expirer au moins 6 mois après la date de départ
      if (departureDate && isBefore(parseISO(p.passportExpiry), addMonths(parseISO(departureDate), 6))) {
        setFormError(`Le passeport de ${p.firstName} ${p.lastName} expire moins de 6 mois après le départ.`);
        return false;
      }
    }
    setFormError('');
    return true;
  };

  // Validation de l'étape 2
  const validateStep2 = () => {
    if (passengers.length === 0) return false;
    for (const p of passengers) {
      const found = rooms.find(r => r.passengerId === p.id);
      if (!found || !found.roomType) {
        setFormError('Chaque passager doit avoir un type de chambre.');
        return false;
      }
    }
    setFormError('');
    return true;
  };

  // Sélection du type de chambre pour un passager
  const setRoomType = (passengerId: string, roomType: string) => {
    setRooms(prev => {
      const exists = prev.find(r => r.passengerId === passengerId);
      if (exists) {
        return prev.map(r => r.passengerId === passengerId ? { ...r, roomType } : r);
      } else {
        return [...prev, { passengerId, roomType }];
      }
    });
  };

  // Calcul du prix selon la tranche d'âge
  const getPassengerPrice = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const rule = pricingRules.find((r: any) => age >= r.minAge && age <= r.maxAge);
    return rule ? rule.price : 0;
  };

  // Calcul du prix total
  const getTotalPrice = () => {
    let total = 0;
    for (const p of passengers) {
      // Prix de base selon l'âge
      const basePrice = getPassengerPrice(p.birthDate);
      
      // Prix de la chambre
      const room = rooms.find(r => r.passengerId === p.id);
      const roomType = roomTypes.find(rt => rt.value === room?.roomType);
      const roomPrice = roomType?.price || 0;
      
      total += basePrice + roomPrice;
    }
    return total;
  };

  // Extraction des informations du passeport
  const extractPassportInfo = async (file: File, passengerId: string) => {
    try {
      const formData = new FormData();
      formData.append('passport', file);

      const response = await fetch('/api/extract-passport', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'extraction des informations');
      }

      const data = await response.json();
      
      // Mise à jour des informations du passager
      setPassengers(prev => prev.map(p => 
        p.id === passengerId 
          ? {
              ...p,
              firstName: data.firstName || p.firstName,
              lastName: data.lastName || p.lastName,
              birthDate: data.birthDate || p.birthDate,
              passportNumber: data.passportNumber || p.passportNumber,
              passportExpiry: data.passportExpiry || p.passportExpiry,
            }
          : p
      ));

      return data;
    } catch (error) {
      console.error('Erreur extraction passeport:', error);
      alert('Erreur lors de l\'extraction des informations du passeport. Veuillez remplir manuellement.');
    }
  };

  // Gestion du téléversement des passeports
  const handlePassportUpload = async (file: File | null, passengerId: string) => {
    if (!file) return;
    
    // Mise à jour du fichier
    updatePassenger(passengerId, 'passportFile', file);
    
    // Extraction des informations
    await extractPassportInfo(file, passengerId);
  };

  // Soumission finale
  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      // Construction des clients (passagers)
      const clients = passengers.map(p => ({
        name: `${p.firstName} ${p.lastName}`,
        birthdate: p.birthDate,
        passportNumber: p.passportNumber,
        passportExpiry: p.passportExpiry,
        roomTypeSelected: rooms.find(r => r.passengerId === p.id)?.roomType || '',
      }));

      // Construction du FormData
      const formData = new FormData();
      formData.append('offer', offer._id || offer.id);
      formData.append('departDateSelected', departureDate);
      formData.append('clients', JSON.stringify(clients));

      // Ajout des fichiers de passeport
      passengers.forEach((p, idx) => {
        if (p.passportFile) {
          formData.append(`passportFiles`, p.passportFile, `${p.firstName}_${p.lastName}_passport.${p.passportFile.name.split('.').pop()}`);
        }
      });

      // Appel API
      const res = await fetch('/api/reservations', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch (e) {}
        const errorMessage = data?.error || data?.message || 'Erreur lors de la réservation';
        alert(errorMessage);
        throw new Error(errorMessage);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/agency/reservations');
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Nouvelle réservation" showBackButton />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">{offer.title}</h2>
            
            {/* Affichage de la date de départ sélectionnée */}
            {departureDate && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Date de départ sélectionnée</div>
                <div className="text-lg text-gray-900">
                  {new Date(departureDate).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-6">
              {steps.map((label, i) => (
                <div key={i} className={`flex-1 text-center py-2 rounded ${i === step ? 'bg-flamingo-500 text-white' : 'bg-gray-100 text-navy-700'}`}>{label}</div>
              ))}
            </div>
            {step === 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Étape 1 : Informations passagers</h2>
                {formError && <div className="text-red-500 mb-2">{formError}</div>}
                
                <div className="space-y-6">
                  {passengers.map((p, idx) => (
                    <div key={p.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow relative">
                      <div className="absolute -top-3 left-4 bg-flamingo-500 text-white px-4 py-1 rounded-full text-sm">
                        Passager {idx + 1}
                      </div>
                      <button 
                        type="button" 
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" 
                        onClick={() => removePassenger(p.id)} 
                        title="Supprimer ce passager"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Passeport
                              <span className="text-xs text-gray-500 ml-1">(PDF, JPG, PNG)</span>
                            </label>
                            <div className="flex gap-3 items-center">
                              <div className="flex-1 relative">
                                <input 
                                  type="file" 
                                  accept=".pdf,.png,.jpg,.jpeg" 
                                  onChange={e => handlePassportUpload(e.target.files?.[0] || null, p.id)}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-flamingo-50 file:text-flamingo-700
                                    hover:file:bg-flamingo-100
                                    cursor-pointer"
                                />
                              </div>
                              {p.passportFile && (
                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Fichier téléversé
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                          <input 
                            className="input w-full focus:ring-2 focus:ring-flamingo-500 focus:border-flamingo-500" 
                            value={p.lastName} 
                            onChange={e => updatePassenger(p.id, 'lastName', e.target.value)} 
                            placeholder="Entrez le nom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                          <input 
                            className="input w-full focus:ring-2 focus:ring-flamingo-500 focus:border-flamingo-500" 
                            value={p.firstName} 
                            onChange={e => updatePassenger(p.id, 'firstName', e.target.value)} 
                            placeholder="Entrez le prénom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                          <input 
                            type="date" 
                            className="input w-full focus:ring-2 focus:ring-flamingo-500 focus:border-flamingo-500" 
                            value={p.birthDate} 
                            onChange={e => updatePassenger(p.id, 'birthDate', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de passeport</label>
                          <input 
                            className="input w-full focus:ring-2 focus:ring-flamingo-500 focus:border-flamingo-500" 
                            value={p.passportNumber} 
                            onChange={e => updatePassenger(p.id, 'passportNumber', e.target.value)} 
                            placeholder="Entrez le numéro de passeport"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration du passeport</label>
                          <input 
                            type="date" 
                            className="input w-full focus:ring-2 focus:ring-flamingo-500 focus:border-flamingo-500" 
                            value={p.passportExpiry} 
                            onChange={e => updatePassenger(p.id, 'passportExpiry', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-flamingo-500 hover:bg-flamingo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flamingo-500 transition-colors" 
                  onClick={addPassenger}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Ajouter un passager
                </button>

                <div className="flex gap-3 mt-6">
                  <button 
                    className="btn-outline flex-1 py-3" 
                    onClick={prev}
                  >
                    Précédent
                  </button>
                  <button 
                    className="btn-primary flex-1 py-3" 
                    onClick={() => { if (validateStep1()) next(); }}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Étape 2 : Choix des chambres</h2>
                {formError && <div className="text-red-500 mb-2">{formError}</div>}
                <div className="space-y-4">
                  {passengers.map((p, idx) => (
                    <div key={p.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="mb-4">
                        <div className="text-lg font-medium text-gray-900">{p.firstName} {p.lastName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date().getFullYear() - new Date(p.birthDate).getFullYear()} ans
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type de chambre</label>
                        <select 
                          className="input w-full focus:ring-2 focus:ring-flamingo-500 focus:border-flamingo-500" 
                          value={rooms.find(r => r.passengerId === p.id)?.roomType || ''} 
                          onChange={e => setRoomType(p.id, e.target.value)}
                        >
                          <option value="">-- Choisir --</option>
                          {roomTypes.map((rt: any) => (
                            <option key={rt.value} value={rt.value}>
                              {rt.label} ({rt.price} DA)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        <div>Prix de base : {getPassengerPrice(p.birthDate)} DA</div>
                        <div>Supplément chambre : {rooms.find(r => r.passengerId === p.id) ? roomTypes.find(rt => rt.value === rooms.find(r => r.passengerId === p.id)?.roomType)?.price || 0 : 0} DA</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-medium text-gray-900">Prix total estimé</div>
                    <div className="text-2xl font-bold text-flamingo-600">{getTotalPrice()} DA</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Ce prix inclut les suppléments de chambre et est calculé selon l'âge de chaque passager
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    className="btn-outline flex-1 py-3" 
                    onClick={prev}
                  >
                    Précédent
                  </button>
                  <button 
                    className="btn-primary flex-1 py-3" 
                    onClick={() => { if (validateStep2()) next(); }}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Étape 3 : Récapitulatif</h2>
                
                {/* Détails de l'offre */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du voyage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Destination</div>
                      <div className="font-medium">{offer.title}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date de départ</div>
                      <div className="font-medium">
                        {new Date(departureDate).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Détails des passagers */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Passagers</h3>
                  <div className="space-y-4">
                    {passengers.map((p, idx) => {
                      const room = rooms.find(r => r.passengerId === p.id);
                      const roomType = roomTypes.find(rt => rt.value === room?.roomType);
                      const age = new Date().getFullYear() - new Date(p.birthDate).getFullYear();
                      
                      return (
                        <div key={p.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium text-lg">{p.firstName} {p.lastName}</div>
                              <div className="text-sm text-gray-500">{age} ans</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Type de chambre</div>
                              <div className="font-medium">{roomType?.label || 'Non sélectionné'}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Numéro de passeport</div>
                              <div>{p.passportNumber}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Date d'expiration</div>
                              <div>{new Date(p.passportExpiry).toLocaleDateString('fr-FR')}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Détail du prix */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Détail du prix</h3>
                  <div className="space-y-2">
                    {passengers.map((p, idx) => {
                      const basePrice = getPassengerPrice(p.birthDate);
                      const room = rooms.find(r => r.passengerId === p.id);
                      const roomType = roomTypes.find(rt => rt.value === room?.roomType);
                      const roomPrice = roomType?.price || 0;
                      const total = basePrice + roomPrice;
                      
                      return (
                        <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium">{p.firstName} {p.lastName}</div>
                            <div className="text-sm text-gray-500">
                              Prix de base ({new Date().getFullYear() - new Date(p.birthDate).getFullYear()} ans) + 
                              {roomType ? ` Chambre ${roomType.label}` : ' Chambre non sélectionnée'}
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
                      <div className="text-2xl font-bold text-flamingo-600">{getTotalPrice()} DA</div>
                    </div>
                  </div>
                </div>

                {/* Conditions et paiement */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={e => setAccepted(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium mb-2">Conditions de réservation</div>
                      <div className="text-sm text-gray-600">
                        J'accepte les conditions générales de vente et la politique d'annulation. 
                        Je comprends que le paiement sera effectué après la confirmation de la réservation.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="btn-outline flex-1 py-3" 
                    onClick={prev}
                  >
                    Précédent
                  </button>
                  <button 
                    className="btn-primary flex-1 py-3" 
                    onClick={handleSubmit}
                    disabled={!accepted || loading}
                  >
                    {loading ? 'Création en cours...' : 'Effectuer le paiement'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyReservationWizard; 