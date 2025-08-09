import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { v4 as uuidv4 } from 'uuid';
import { PricingRule, CancellationPolicy, DailyProgram, Hotel, RoomType, DepartDate } from '../../types';
import { Trash2 } from 'lucide-react';

const AdminOfferEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // mêmes états que dans AdminOfferCreate
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [cities, setCities] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hotels, setHotels] = useState<Hotel[]>([{ name: '', stars: 3 }]);
  const [dailyProgram, setDailyProgram] = useState<DailyProgram[]>([{ day: 1, content: '' }]);
  const [inclusions, setInclusions] = useState<string[]>(['']);
  const [exclusions, setExclusions] = useState<string[]>(['']);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([{ 
    id: crypto.randomUUID(),
    minAge: 0,
    maxAge: 0,
    price: 0 
  }]);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy[]>([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([{
    id: crypto.randomUUID(),
    label: '',
    price: 0,
    capacity: 1,
    pricePerPerson: true
  }]);
  const [departDates, setDepartDates] = useState<DepartDate[]>([]);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setCountry(data.country);
        setCities(data.cities);
        setDescription(data.description);
        setImageUrl(data.imageUrl);
        setHotels(data.hotels);
        setDailyProgram(data.dailyProgram);
        setInclusions(data.inclusions);
        setExclusions(data.exclusions);
        setPricingRules(
          (data.pricingRules || []).map((rule: PricingRule) => ({
            ...rule,
            id: rule.id || uuidv4()
          }))
        );
        setCancellationPolicy(
          (data.cancellationPolicy || []).map((policy: CancellationPolicy) => ({
            ...policy,
            id: policy.id || uuidv4()
          }))
        );
        setTotalSeats(data.totalSeats);
        setRoomTypes(data.roomTypes || [{
          id: uuidv4(),
          label: '',
          price: 0,
          capacity: 1,
          pricePerPerson: true
        }]);
        setDepartDates(data.departDates || [{ label: '', date: '', dateRetour: '' }]);
        setLoading(false);
      });
  }, [id]);

  // Les handlers sont identiques à AdminOfferCreate (à factoriser si besoin)
  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const offerData = {
      title, country, cities, hotels, description, dailyProgram, inclusions, exclusions, 
      pricingRules, cancellationPolicy, totalSeats, imageUrl, departDates, roomTypes
    };
    const res = await fetch(`/api/offers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(offerData),
    });
    if (res.ok) {
      alert('Offre modifiée avec succès !');
      navigate(`/admin/offers/${id}`);
    } else {
      const err = await res.json().catch(() => null);
      setError(err?.message || 'Erreur lors de la modification.');
    }
  };

  // Ajout des fonctions utilitaires pour les règles de tarification
  const handlePricingRuleChange = (index: number, field: keyof PricingRule, value: string | number) => {
    const newRules = [...pricingRules];
    newRules[index] = { 
      ...newRules[index], 
      [field]: field === 'id' ? value : Number(value) 
    };
    setPricingRules(newRules);
  };

  const addPricingRule = () => {
    setPricingRules([...pricingRules, { id: uuidv4(), minAge: 0, maxAge: 0, price: 0 }]);
  };

  const removePricingRule = (id: string) => {
    if (pricingRules.length > 1) {
      setPricingRules(pricingRules.filter(rule => rule.id !== id));
    }
  };

  // Ajout des fonctions utilitaires pour la politique d'annulation
  const handleCancellationPolicyChange = (index: number, field: keyof CancellationPolicy, value: string | number) => {
    const newPolicies = [...cancellationPolicy];
    newPolicies[index] = { 
      ...newPolicies[index], 
      [field]: field === 'id' ? value : Number(value) 
    };
    setCancellationPolicy(newPolicies);
  };

  const addCancellationPolicy = () => {
    setCancellationPolicy([...cancellationPolicy, { 
      id: uuidv4(), 
      minDaysBeforeDeparture: 0, 
      refundPercent: 0 
    }]);
  };

  const removeCancellationPolicy = (id: string) => {
    if (cancellationPolicy.length > 1) {
      setCancellationPolicy(cancellationPolicy.filter(policy => policy.id !== id));
    }
  };

  const handleRoomTypeChange = (index: number, field: keyof RoomType, value: string | number | boolean) => {
    const newRoomTypes = [...roomTypes];
    newRoomTypes[index] = {
      ...newRoomTypes[index],
      [field]: field === 'id' ? value : field === 'pricePerPerson' ? value : Number(value)
    };
    setRoomTypes(newRoomTypes);
  };

  const handleAddRoomType = () => {
    setRoomTypes([...roomTypes, {
      id: crypto.randomUUID(),
      label: '',
      price: 0,
      capacity: 1,
      pricePerPerson: true
    }]);
  };

  const removeRoomType = (index: number) => {
    if (roomTypes.length > 1) {
      const newTypes = [...roomTypes];
      newTypes.splice(index, 1);
      setRoomTypes(newTypes);
    }
  };

  const handleDepartDateChange = (index: number, field: keyof DepartDate, value: string) => {
    const newDates = [...departDates];
    newDates[index][field] = value;
    setDepartDates(newDates);
  };

  const addDepartDate = () => setDepartDates([...departDates, { label: '', date: '', dateRetour: '' }]);

  const removeDepartDate = (index: number) => {
    if (departDates.length > 1) {
      const newDates = [...departDates];
      newDates.splice(index, 1);
      setDepartDates(newDates);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <PageHeader title="Modifier l'offre" showBackButton />
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto mt-6 space-y-6">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="form-group">
          <label className="label">Titre de l'offre</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Pays</label>
            <input className="input" value={country} onChange={e => setCountry(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Villes</label>
            {cities.map((city, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input className="input flex-grow" value={city} onChange={e => {
                  const newCities = [...cities];
                  newCities[idx] = e.target.value;
                  setCities(newCities);
                }} required />
                {cities.length > 1 && (
                  <button type="button" className="ml-2 text-red-500" onClick={() => {
                    const newCities = [...cities];
                    newCities.splice(idx, 1);
                    setCities(newCities);
                  }}><Trash2 size={18} /></button>
                )}
              </div>
            ))}
            <button type="button" className="btn-outline btn-xs mt-2" onClick={() => setCities([...cities, ''])}>+ Ajouter une ville</button>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Description</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="label">Image (URL)</label>
          <input className="input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Hôtels</label>
          {hotels.map((hotel, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input className="input flex-grow" value={hotel.name} onChange={e => {
                const newHotels = [...hotels];
                newHotels[idx].name = e.target.value;
                setHotels(newHotels);
              }} placeholder="Nom de l'hôtel" required />
              <input className="input w-20" type="number" min={1} max={5} value={hotel.stars} onChange={e => {
                const newHotels = [...hotels];
                newHotels[idx].stars = Number(e.target.value);
                setHotels(newHotels);
              }} placeholder="Étoiles" required />
              {hotels.length > 1 && (
                <button type="button" className="text-red-500" onClick={() => {
                  const newHotels = [...hotels];
                  newHotels.splice(idx, 1);
                  setHotels(newHotels);
                }}><Trash2 size={18} /></button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline btn-xs mt-2" onClick={() => setHotels([...hotels, { name: '', stars: 3 }])}>+ Ajouter un hôtel</button>
        </div>
        <div className="form-group">
          <label className="label">Programme journalier</label>
          {dailyProgram.map((day, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <span className="w-16">Jour {day.day}</span>
              <input className="input flex-grow" value={day.content} onChange={e => {
                const newProgram = [...dailyProgram];
                newProgram[idx].content = e.target.value;
                setDailyProgram(newProgram);
              }} placeholder="Programme de la journée" required />
              {dailyProgram.length > 1 && (
                <button type="button" className="text-red-500" onClick={() => {
                  const newProgram = [...dailyProgram];
                  newProgram.splice(idx, 1);
                  setDailyProgram(newProgram);
                }}><Trash2 size={18} /></button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline btn-xs mt-2" onClick={() => {
            const nextDay = dailyProgram.length > 0 ? Math.max(...dailyProgram.map(d => d.day)) + 1 : 1;
            setDailyProgram([...dailyProgram, { day: nextDay, content: '' }]);
          }}>+ Ajouter un jour</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Inclusions</label>
            {inclusions.map((item, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input className="input flex-grow" value={item} onChange={e => {
                  const newInclusions = [...inclusions];
                  newInclusions[idx] = e.target.value;
                  setInclusions(newInclusions);
                }} required />
                {inclusions.length > 1 && (
                  <button type="button" className="ml-2 text-red-500" onClick={() => {
                    const newInclusions = [...inclusions];
                    newInclusions.splice(idx, 1);
                    setInclusions(newInclusions);
                  }}><Trash2 size={18} /></button>
                )}
              </div>
            ))}
            <button type="button" className="btn-outline btn-xs mt-2" onClick={() => setInclusions([...inclusions, ''])}>+ Ajouter une inclusion</button>
          </div>
          <div className="form-group">
            <label className="label">Exclusions</label>
            {exclusions.map((item, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input className="input flex-grow" value={item} onChange={e => {
                  const newExclusions = [...exclusions];
                  newExclusions[idx] = e.target.value;
                  setExclusions(newExclusions);
                }} required />
                {exclusions.length > 1 && (
                  <button type="button" className="ml-2 text-red-500" onClick={() => {
                    const newExclusions = [...exclusions];
                    newExclusions.splice(idx, 1);
                    setExclusions(newExclusions);
                  }}><Trash2 size={18} /></button>
                )}
              </div>
            ))}
            <button type="button" className="btn-outline btn-xs mt-2" onClick={() => setExclusions([...exclusions, ''])}>+ Ajouter une exclusion</button>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Règles tarifaires selon l'âge</label>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left">Âge min</th>
                  <th className="px-3 py-2 text-left">Âge max</th>
                  <th className="px-3 py-2 text-left">Tarif (DA)</th>
                  <th className="px-3 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {pricingRules.map((rule, idx) => (
                  <tr key={rule.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">
                      <input type="number" className="input" value={rule.minAge} onChange={e => handlePricingRuleChange(idx, 'minAge', e.target.value)} min={0} required />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" className="input" value={rule.maxAge} onChange={e => handlePricingRuleChange(idx, 'maxAge', e.target.value)} min={0} required />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" className="input" value={rule.price} onChange={e => handlePricingRuleChange(idx, 'price', e.target.value)} min={0} required />
                    </td>
                    <td className="px-3 py-2">
                      {pricingRules.length > 1 && (
                        <button type="button" className="p-2 text-red-500 hover:text-red-700" onClick={() => removePricingRule(rule.id)}><Trash2 size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="mt-3 btn-outline btn-xs" onClick={addPricingRule}>+ Ajouter une règle tarifaire</button>
        </div>
        <div className="form-group">
          <label className="label">Politique d'annulation</label>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left">Jours avant départ</th>
                  <th className="px-3 py-2 text-left">Pourcentage de remboursement</th>
                  <th className="px-3 py-2 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {cancellationPolicy.map((policy, idx) => (
                  <tr key={policy.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">
                      <input type="number" className="input" value={policy.minDaysBeforeDeparture} onChange={e => handleCancellationPolicyChange(idx, 'minDaysBeforeDeparture', e.target.value)} min={0} required />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" className="input" value={policy.refundPercent} onChange={e => handleCancellationPolicyChange(idx, 'refundPercent', e.target.value)} min={0} max={100} required />
                    </td>
                    <td className="px-3 py-2">
                      {cancellationPolicy.length > 1 && (
                        <button type="button" className="p-2 text-red-500 hover:text-red-700" onClick={() => removeCancellationPolicy(policy.id)}><Trash2 size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="mt-3 btn-outline btn-xs" onClick={addCancellationPolicy}>+ Ajouter une règle d'annulation</button>
        </div>
        <div className="form-group">
          <label className="label">Nombre total de places disponibles</label>
          <input type="number" className="input" value={totalSeats} onChange={e => setTotalSeats(Number(e.target.value))} min={1} required />
        </div>
        <div className="form-group">
          <label className="label">Types de chambre</label>
          {roomTypes.map((type, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input className="input flex-grow" value={type.label} onChange={e => handleRoomTypeChange(idx, 'label', e.target.value)} required />
              <input className="input w-20" type="number" min={0} value={type.price} onChange={e => handleRoomTypeChange(idx, 'price', e.target.value)} required />
              <input className="input w-20" type="number" min={0} value={type.capacity} onChange={e => handleRoomTypeChange(idx, 'capacity', e.target.value)} required />
              <input className="input w-20" type="checkbox" checked={type.pricePerPerson} onChange={e => handleRoomTypeChange(idx, 'pricePerPerson', e.target.checked)} />
              {roomTypes.length > 1 && (
                <button type="button" className="text-red-500" onClick={() => removeRoomType(idx)}><Trash2 size={18} /></button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline btn-xs mt-2" onClick={handleAddRoomType}>+ Ajouter un type de chambre</button>
        </div>
        <div className="form-group">
          <label className="label">Dates de départ</label>
          {departDates.map((date, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input className="input flex-grow" value={date.label} onChange={e => handleDepartDateChange(idx, 'label', e.target.value)} required />
              <input className="input" type="date" value={date.date} onChange={e => handleDepartDateChange(idx, 'date', e.target.value)} required />
              <input className="input" type="date" value={date.dateRetour} onChange={e => handleDepartDateChange(idx, 'dateRetour', e.target.value)} required />
              {departDates.length > 1 && (
                <button type="button" className="text-red-500" onClick={() => removeDepartDate(idx)}><Trash2 size={18} /></button>
              )}
            </div>
          ))}
          <button type="button" className="btn-outline btn-xs mt-2" onClick={addDepartDate}>+ Ajouter une date de départ</button>
        </div>
        <button type="submit" className="btn-primary w-full">Enregistrer</button>
      </form>
    </div>
  );
};

export default AdminOfferEdit; 