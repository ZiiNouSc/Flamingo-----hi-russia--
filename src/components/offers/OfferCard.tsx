import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Users } from 'lucide-react';
import { Offer } from '../../types';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OfferCardProps {
  offer: Offer;
  linkPath: string;
  showReservationStatus?: boolean;
}

const OfferCard: React.FC<OfferCardProps> = ({ 
  offer, 
  linkPath,
  showReservationStatus = false
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Date inconnue';
    return format(d, 'd MMM yyyy', { locale: fr });
  };

  const getNextDepartureDate = () => {
    if (!offer.departDates || offer.departDates.length === 0) return null;
    
    const today = new Date();
    const validDates = offer.departDates
      .map(d => parseISO(d.date))
      .filter(d => isAfter(d, today))
      .sort((a, b) => a.getTime() - b.getTime());
    
    return validDates.length > 0 ? validDates[0] : null;
  };

  const getOtherDatesCount = () => {
    if (!offer.departDates || offer.departDates.length <= 1) return 0;
    const today = new Date();
    return offer.departDates
      .map(d => parseISO(d.date))
      .filter(d => isAfter(d, today))
      .length - 1;
  };

  const nextDate = getNextDepartureDate();
  const otherDatesCount = getOtherDatesCount();

  return (
    <div className="card hover:shadow-lg group">
      <Link to={linkPath} className="block h-full">
        <div className="relative">
          <div className="h-48 w-full overflow-hidden">
            <img 
              src={offer.imageUrl} 
              alt={offer.title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          
          {typeof offer.availableSeats === 'number' && typeof offer.alertThreshold === 'number' && offer.availableSeats <= offer.alertThreshold && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-flamingo">
                Il reste peu de places !
              </span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2 text-navy-900 line-clamp-2">
            {offer.title}
          </h3>
          
          <div className="flex items-center text-navy-600 mb-3">
            <MapPin size={16} className="mr-1 text-flamingo-500" />
            <span className="text-sm">
              {offer.country}, {offer.cities.join(', ')}
            </span>
          </div>
          
          <div className="flex items-center text-navy-600 mb-3">
            <Calendar size={16} className="mr-1 text-flamingo-500" />
            <span className="text-sm">
              {nextDate ? (
                <>
                  {formatDate(nextDate.toISOString())}
                  {otherDatesCount > 0 && (
                    <span className="text-flamingo-500 ml-1">
                      (+{otherDatesCount} autre{otherDatesCount > 1 ? 's' : ''} départ{otherDatesCount > 1 ? 's' : ''})
                    </span>
                  )}
                </>
              ) : (
                'Aucune date disponible'
              )}
            </span>
          </div>
          
          <div className="flex items-center text-navy-600 mb-4">
            <Star size={16} className="mr-1 text-flamingo-500" />
            <span className="text-sm">
              {offer.hotels.map(hotel => hotel.stars).reduce((a, b) => a + b, 0) / offer.hotels.length} Étoiles
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-navy-600">
              <Users size={16} className="mr-1 text-flamingo-500" />
              <span className="text-sm">
                {typeof offer.availableSeats === 'number' && typeof offer.alertThreshold === 'number' && offer.availableSeats <= offer.alertThreshold
                  ? `${offer.availableSeats} places restantes`
                  : ''}
              </span>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-navy-500">À partir de</p>
              <p className="text-lg font-bold text-flamingo-600">
                {Math.min(...offer.pricingRules.map(rule => rule.price))} DA
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default OfferCard;