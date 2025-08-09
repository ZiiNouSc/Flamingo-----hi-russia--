import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import OfferCard from '../../components/offers/OfferCard';

const AdminOfferList: React.FC = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/offers')
      .then(res => res.json())
      .then(data => {
        setOffers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <PageHeader 
        title="Gérer les offres" 
        subtitle="Créez et gérez les offres de voyage pour les agences"
        action={
          <Link to="/admin/offers/new" className="btn-primary flex items-center">
            <Plus size={18} className="mr-1" />
            Créer une nouvelle offre
          </Link>
        }
      />
      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-navy-900 mb-2">Aucune offre disponible</h3>
          <p className="text-navy-600 mb-4">
            Vous n'avez pas encore créé d'offres de voyage. Commencez par créer votre première offre.
          </p>
          <Link to="/admin/offers/new" className="btn-primary inline-flex items-center">
            <Plus size={18} className="mr-1" />
            Créer une nouvelle offre
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: any) => (
            <OfferCard 
              key={offer._id} 
              offer={offer} 
              linkPath={`/admin/offers/${offer._id}`}
              showReservationStatus
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOfferList;