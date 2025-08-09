import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import OfferCard from '../../components/offers/OfferCard';

const AgencyOfferList: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        setOffers(data);
        setLoading(false);
      });
  }, []);

  const filteredOffers = offers.filter(offer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      offer.title.toLowerCase().includes(searchLower) ||
      offer.country.toLowerCase().includes(searchLower) ||
      offer.cities.some((city: string) => city.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <PageHeader 
        title="Offres de voyage disponibles" 
        subtitle="Parcourez et réservez des forfaits de groupe pour vos clients"
      />
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-navy-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Rechercher par destination, pays ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-navy-900 mb-2">Aucune offre trouvée</h3>
          <p className="text-navy-600">
            {searchTerm 
              ? `Aucune offre correspondant à "${searchTerm}" n'a été trouvée. Essayez une autre recherche.`
              : "Il n'y a aucune offre de voyage disponible pour le moment. Veuillez revenir plus tard."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <OfferCard 
              key={offer.id || offer._id} 
              offer={offer} 
              linkPath={`/agency/offers/${offer.id || offer._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgencyOfferList;