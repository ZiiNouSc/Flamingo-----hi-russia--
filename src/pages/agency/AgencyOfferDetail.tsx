import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, Clock, MapPin, Users, Star, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import FileUpload from '../../components/common/FileUpload';
import { Passenger, UploadedFile, Offer, Hotel, DailyProgram, DepartDate, PricingRule } from '../../types';
import Tesseract from 'tesseract.js';
import AgencyReservationWizard from './AgencyReservationWizard';

const AgencyOfferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartDate, setSelectedDepartDate] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Date inconnue';
    return format(d, 'd MMM yyyy', { locale: fr });
  };
  
  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then(res => res.json())
      .then(data => {
        setOffer(data);
        setLoading(false);
      });
  }, [id]);
  
  if (loading) return <div>Chargement...</div>;
  if (!offer) {
    return (
      <div>
        <PageHeader title="Offre Non Trouvée" showBackButton />
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-navy-600 mb-4">
            L'offre que vous recherchez n'a pas été trouvée.
          </p>
          <button 
            onClick={() => navigate('/agency/offers')}
            className="btn-primary"
          >
            Retour aux Offres
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader title={offer.title} showBackButton />
      
      {/* Image en pleine largeur */}
      <div className="relative h-[400px] w-full mb-8">
        <img 
          src={offer.imageUrl} 
          alt={offer.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">{offer.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <MapPin size={20} className="mr-2" />
              <span>{offer.country}, {offer.cities.join(', ')}</span>
            </div>
            <div className="flex items-center">
              <Star size={20} className="mr-2" />
              <span>{offer.hotels.map((hotel: Hotel) => hotel.stars).reduce((a: number, b: number) => a + b, 0) / offer.hotels.length} Étoiles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Détails de l'offre */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-navy-900">Description</h2>
              <p className="text-navy-600 whitespace-pre-line">{offer.description}</p>
            </div>

            {/* Programme */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-navy-900">Programme</h2>
              <div className="space-y-4">
                {offer.dailyProgram.map((day: DailyProgram, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-flamingo-100 text-flamingo-600 flex items-center justify-center font-semibold">
                      {day.day}
                    </div>
                    <p className="text-navy-600">{day.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hôtels */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-navy-900">Hébergement</h2>
              <div className="space-y-4">
                {offer.hotels.map((hotel: Hotel, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Star size={16} className="text-flamingo-500" />
                    <span className="text-navy-600">{hotel.name} - {hotel.stars} étoiles</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions/Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-navy-900">Inclus</h2>
                <ul className="space-y-2">
                  {offer.inclusions.map((item: string, index: number) => (
                    <li key={index} className="flex items-center text-navy-600">
                      <span className="w-2 h-2 bg-flamingo-500 rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-navy-900">Non inclus</h2>
                <ul className="space-y-2">
                  {offer.exclusions.map((item: string, index: number) => (
                    <li key={index} className="flex items-center text-navy-600">
                      <span className="w-2 h-2 bg-navy-300 rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Colonne de droite - Formulaire de réservation */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  {/* Dates de départ */}
                  <div>
                    <label className="label">Date de départ</label>
                    <select 
                      className="input"
                      value={selectedDepartDate}
                      onChange={(e) => setSelectedDepartDate(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez une date</option>
                      {offer.departDates.map((date: DepartDate, index: number) => (
                        <option key={index} value={date.date}>
                          {formatDate(date.date)} - {formatDate(date.dateRetour)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre de passagers */}
                  <div>
                    <label className="label">Nombre de passagers</label>
                    <input
                      type="number"
                      min="1"
                      max={offer.availableSeats}
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                      className="input"
                      required
                    />
                    <p className="text-sm text-navy-500 mt-1">
                      {offer.availableSeats} places disponibles
                    </p>
                  </div>

                  {/* Prix */}
                  <div className="border-t border-navy-100 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-navy-600">Prix par personne</span>
                      <span className="font-semibold text-navy-900">
                        {Math.min(...offer.pricingRules.map((rule: PricingRule) => rule.price))} DA
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-flamingo-600">
                      <span>Total estimé</span>
                      <span>
                        {Math.min(...offer.pricingRules.map((rule: PricingRule) => rule.price)) * passengerCount} DA
                      </span>
                    </div>
                  </div>

                  {/* Bouton de réservation */}
                  <Link 
                    to={`/agency/offers/${offer._id}/reserve?date=${selectedDepartDate}&passengers=${passengerCount}`}
                    className="btn-primary w-full"
                    onClick={(e) => {
                      if (!selectedDepartDate) {
                        e.preventDefault();
                        alert('Veuillez sélectionner une date de départ');
                      }
                    }}
                  >
                    Réserver
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyOfferDetail;