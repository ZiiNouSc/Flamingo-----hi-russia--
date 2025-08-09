import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Building, Upload } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import FileUpload from '../../components/common/FileUpload';
import { UploadedFile } from '../../types';

const AgencyPayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('bank');
  const [paymentProof, setPaymentProof] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [paymentType, setPaymentType] = useState<'acompte' | 'solde' | 'total'>('acompte');
  const [amount, setAmount] = useState<number>(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    // Récupérer la réservation et l'offre associée
    fetch(`/api/reservations/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setReservation(data);
        if (data.offer) {
          fetch(`/api/offers/${data.offer._id || data.offer.id}`)
            .then(res => res.json())
            .then(setOffer);
        }
        setLoading(false);
      });
  }, [id]);

  const handleFilesChange = (files: UploadedFile[]) => {
    setPaymentProof(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('type', paymentType);
      formData.append('amount', String(amount));
      if (comment) formData.append('comment', comment);
      if (paymentProof[0]) {
        const file = (paymentProof[0] as any).file || paymentProof[0];
        if (file instanceof File) {
          formData.append('paymentProof', file);
        }
      }
      const res = await fetch(`/api/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      if (res.ok) {
        alert('Paiement enregistré avec succès !');
        navigate('/agency/reservations');
      } else {
        setError("Erreur lors de l'envoi du paiement.");
      }
    } catch (err) {
      setError("Erreur lors de l'envoi du paiement.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!reservation || !offer) {
    return (
      <div>
        <PageHeader title="Réservation introuvable" showBackButton />
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-navy-600 mb-4">La réservation recherchée est introuvable.</p>
          <button onClick={() => navigate('/agency/reservations')} className="btn-primary">Retour aux réservations</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Finaliser le paiement" 
        subtitle={`Réservation pour ${offer.title}`}
        showBackButton
      />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Méthodes de paiement et upload */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Méthodes de paiement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                className={`flex items-center p-4 rounded-lg border-2 ${
                  paymentMethod === 'card'
                    ? 'border-flamingo-500 bg-flamingo-50'
                    : 'border-gray-200 hover:border-navy-300'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={24} className={`mr-3 ${
                  paymentMethod === 'card' ? 'text-flamingo-500' : 'text-navy-400'
                }`} />
                <div className="text-left">
                  <h3 className="font-medium text-navy-800">Carte bancaire</h3>
                  <p className="text-sm text-navy-600">Payez en ligne en toute sécurité</p>
                </div>
              </button>
              <button
                type="button"
                className={`flex items-center p-4 rounded-lg border-2 ${
                  paymentMethod === 'bank'
                    ? 'border-flamingo-500 bg-flamingo-50'
                    : 'border-gray-200 hover:border-navy-300'
                }`}
                onClick={() => setPaymentMethod('bank')}
              >
                <Building size={24} className={`mr-3 ${
                  paymentMethod === 'bank' ? 'text-flamingo-500' : 'text-navy-400'
                }`} />
                <div className="text-left">
                  <h3 className="font-medium text-navy-800">Virement bancaire</h3>
                  <p className="text-sm text-navy-600">Téléchargez le reçu de paiement</p>
                </div>
              </button>
            </div>
            {paymentMethod === 'card' && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="form-group">
                  <label htmlFor="cardName" className="label">Nom du titulaire</label>
                  <input type="text" id="cardName" className="input" placeholder="John Smith" />
                </div>
                <div className="form-group">
                  <label htmlFor="cardNumber" className="label">Numéro de carte</label>
                  <input type="text" id="cardNumber" className="input" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="expiryDate" className="label">Date d'expiration</label>
                    <input type="text" id="expiryDate" className="input" placeholder="MM/YY" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv" className="label">CVV</label>
                    <input type="text" id="cvv" className="input" placeholder="123" />
                  </div>
                </div>
              </div>
            )}
            {paymentMethod === 'bank' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-navy-800 mb-3">Détails du virement bancaire</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-navy-600">Nom de la banque :</span>
                      <span className="font-medium">Global Bank Ltd.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-600">Nom du compte :</span>
                      <span className="font-medium">Flamingo Travel Ltd.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-600">Numéro de compte :</span>
                      <span className="font-medium">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-600">SWIFT/BIC :</span>
                      <span className="font-medium">GLBLABCD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-600">Référence :</span>
                      <span className="font-medium">RES-{reservation._id || reservation.id}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-navy-600">Veuillez inclure le numéro de référence dans la description de votre paiement</p>
                </div>
                <div>
                  <FileUpload
                    label="Télécharger la preuve de paiement"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple={false}
                    onFilesChange={handleFilesChange}
                  />
                </div>
              </div>
            )}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Type de paiement</label>
              <select className="input w-full" value={paymentType} onChange={e => setPaymentType(e.target.value as any)}>
                <option value="acompte">Acompte</option>
                <option value="solde">Solde</option>
                <option value="total">Total</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Montant</label>
              <input type="number" className="input w-full" min={1} max={reservation.totalPrice} value={amount} onChange={e => setAmount(Number(e.target.value))} />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Commentaire (optionnel)</label>
              <input type="text" className="input w-full" value={comment} onChange={e => setComment(e.target.value)} placeholder="Ex: acompte sans justificatif, virement en attente, etc." />
            </div>
          </div>
        </div>
        {/* Résumé */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Résumé de la réservation</h2>
            <div className="mb-6">
              <h3 className="font-medium text-navy-800 mb-2">{offer.title}</h3>
              <p className="text-navy-600 text-sm">{offer.country}, {offer.cities?.join(', ')}</p>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-navy-600">Passagers :</span>
                  <span className="font-medium">{reservation.passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-600">ID de réservation :</span>
                  <span className="font-medium">RES-{reservation._id || reservation.id}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-navy-800 mb-3">Détails du prix</h4>
              {reservation.passengers.map((passenger: any, index: number) => (
                <div key={index} className="flex justify-between mb-2">
                  <span className="text-navy-600">{passenger.name}:</span>
                  <span className="font-medium">{passenger.calculatedPrice} DA</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total :</span>
                  <span className="text-flamingo-600">{reservation.totalPrice} DA</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full btn-primary flex justify-center items-center"
              disabled={paymentMethod === 'bank' && paymentProof.length === 0 || uploading}
            >
              <Upload size={18} className="mr-2" />
              {uploading ? 'Envoi en cours...' : 'Finaliser le paiement'}
            </button>
            <p className="mt-4 text-xs text-navy-500 text-center">
              En finalisant le paiement, vous acceptez nos conditions générales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyPayment;