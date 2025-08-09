import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { PricingRule, CancellationPolicy, DailyProgram, Hotel } from '../../types';
import { v4 as uuidv4 } from 'uuid';

type RoomType = { label: string; price: number; capacity: number; pricePerPerson: boolean };

const AdminOfferCreate: React.FC = () => {
  const navigate = useNavigate();
  
  // Basic details
  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('');
  const [cities, setCities] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Hotels
  const [hotels, setHotels] = useState<Hotel[]>([{ name: '', stars: 3 }]);
  
  // Dates multiples
  const [departDates, setDepartDates] = useState([{ label: '', date: '', dateRetour: '' }]);
  // Types de chambres
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([{ label: '', price: 0, capacity: 1, pricePerPerson: true }]);
  
  // Program
  const [dailyProgram, setDailyProgram] = useState<DailyProgram[]>([
    { day: 1, content: '' }
  ]);
  
  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>(['']);
  const [exclusions, setExclusions] = useState<string[]>(['']);
  
  // Pricing & Availability
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    { id: uuidv4(), minAge: 0, maxAge: 2, price: 0 },
    { id: uuidv4(), minAge: 3, maxAge: 12, price: 0 },
    { id: uuidv4(), minAge: 13, maxAge: 64, price: 0 },
    { id: uuidv4(), minAge: 65, maxAge: 120, price: 0 },
  ]);
  
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy[]>([
    { id: uuidv4(), minDaysBeforeDeparture: 60, refundPercent: 90 },
    { id: uuidv4(), minDaysBeforeDeparture: 30, refundPercent: 70 },
    { id: uuidv4(), minDaysBeforeDeparture: 15, refundPercent: 50 },
    { id: uuidv4(), minDaysBeforeDeparture: 7, refundPercent: 30 },
    { id: uuidv4(), minDaysBeforeDeparture: 3, refundPercent: 10 },
    { id: uuidv4(), minDaysBeforeDeparture: 0, refundPercent: 0 },
  ]);
  
  const [totalSeats, setTotalSeats] = useState(20);
  
  // Form handling
  const [activeTab, setActiveTab] = useState(1);
  
  // Handle cities
  const handleCityChange = (index: number, value: string) => {
    const newCities = [...cities];
    newCities[index] = value;
    setCities(newCities);
  };
  
  const addCity = () => {
    setCities([...cities, '']);
  };
  
  const removeCity = (index: number) => {
    if (cities.length > 1) {
      const newCities = [...cities];
      newCities.splice(index, 1);
      setCities(newCities);
    }
  };
  
  // Handle hotels
  const handleHotelChange = (index: number, field: keyof Hotel, value: any) => {
    const newHotels = [...hotels];
    newHotels[index] = { ...newHotels[index], [field]: value };
    setHotels(newHotels);
  };
  
  const addHotel = () => {
    setHotels([...hotels, { name: '', stars: 3 }]);
  };
  
  const removeHotel = (index: number) => {
    if (hotels.length > 1) {
      const newHotels = [...hotels];
      newHotels.splice(index, 1);
      setHotels(newHotels);
    }
  };
  
  // Handle daily program
  const handleProgramChange = (index: number, field: keyof DailyProgram, value: any) => {
    const newProgram = [...dailyProgram];
    newProgram[index] = { ...newProgram[index], [field]: value };
    setDailyProgram(newProgram);
  };
  
  const addProgramDay = () => {
    const nextDay = dailyProgram.length > 0 
      ? Math.max(...dailyProgram.map(d => d.day)) + 1 
      : 1;
    setDailyProgram([...dailyProgram, { day: nextDay, content: '' }]);
  };
  
  const removeProgramDay = (index: number) => {
    if (dailyProgram.length > 1) {
      const newProgram = [...dailyProgram];
      newProgram.splice(index, 1);
      setDailyProgram(newProgram);
    }
  };
  
  // Handle inclusions
  const handleInclusionChange = (index: number, value: string) => {
    const newInclusions = [...inclusions];
    newInclusions[index] = value;
    setInclusions(newInclusions);
  };
  
  const addInclusion = () => {
    setInclusions([...inclusions, '']);
  };
  
  const removeInclusion = (index: number) => {
    if (inclusions.length > 1) {
      const newInclusions = [...inclusions];
      newInclusions.splice(index, 1);
      setInclusions(newInclusions);
    }
  };
  
  // Handle exclusions
  const handleExclusionChange = (index: number, value: string) => {
    const newExclusions = [...exclusions];
    newExclusions[index] = value;
    setExclusions(newExclusions);
  };
  
  const addExclusion = () => {
    setExclusions([...exclusions, '']);
  };
  
  const removeExclusion = (index: number) => {
    if (exclusions.length > 1) {
      const newExclusions = [...exclusions];
      newExclusions.splice(index, 1);
      setExclusions(newExclusions);
    }
  };
  
  // Handle pricing rules
  const handlePricingRuleChange = (id: string, field: keyof PricingRule, value: any) => {
    const newRules = pricingRules.map(rule => 
      rule.id === id ? { ...rule, [field]: Number(value) } : rule
    );
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
  
  // Handle cancellation policy
  const handleCancellationPolicyChange = (id: string, field: keyof CancellationPolicy, value: any) => {
    const newPolicies = cancellationPolicy.map(policy => 
      policy.id === id ? { ...policy, [field]: Number(value) } : policy
    );
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
  
  // Handle departDates
  const handleDepartDateChange = (index: number, field: 'label' | 'date' | 'dateRetour', value: string) => {
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
  
  // Handle roomTypes
  const handleRoomTypeChange = (index: number, field: keyof RoomType, value: any) => {
    const newTypes = [...roomTypes];
    (newTypes[index][field] as any) = field === 'price' || field === 'capacity' ? Number(value) : value;
    setRoomTypes(newTypes);
  };
  const addRoomType = () => setRoomTypes([...roomTypes, { label: '', price: 0, capacity: 1, pricePerPerson: true }]);
  const removeRoomType = (index: number) => {
    if (roomTypes.length > 1) {
      const newTypes = [...roomTypes];
      newTypes.splice(index, 1);
      setRoomTypes(newTypes);
    }
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const offerData = {
      title,
      country,
      cities,
      hotels,
      departDates,
      description,
      dailyProgram,
      inclusions,
      exclusions,
      pricingRules,
      cancellationPolicy,
      totalSeats,
      availableSeats: totalSeats,
      imageUrl,
      roomTypes,
    };
    const token = localStorage.getItem('token');
    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(offerData),
    });
    if (res.ok) {
      alert('Offre créée avec succès !');
      navigate('/admin/offers');
    } else {
      const error = await res.json().catch(() => null);
      alert('Erreur lors de la création de l\'offre : ' + (error?.message || 'Vérifiez les champs obligatoires.'));
    }
  };
  
  // Tab navigation
  const tabs = [
    { id: 1, label: 'Détails de base' },
    { id: 2, label: 'Programme & Inclusions' },
    { id: 3, label: 'Tarifs & Politiques' },
  ];
  
  const nextTab = () => {
    setActiveTab(Math.min(activeTab + 1, tabs.length));
  };
  
  const prevTab = () => {
    setActiveTab(Math.max(activeTab - 1, 1));
  };
  
  return (
    <div>
      <PageHeader 
        title="Créer une nouvelle offre" 
        subtitle="Créez un nouveau forfait voyage pour les agences"
        showBackButton
      />
      
      <div className="bg-white rounded-lg shadow-md">
        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-flamingo-500 text-flamingo-600'
                    : 'border-transparent text-navy-600 hover:text-navy-800 hover:border-navy-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Details */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="title\" className="label">Titre de l'offre</label>
                <input
                  type="text"
                  id="title"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entrez un titre descriptif"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="country" className="label">Pays</label>
                  <input
                    type="text"
                    id="country"
                    className="input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="ex : Grèce"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Villes</label>
                  <div className="space-y-3">
                    {cities.map((city, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          className="input flex-grow"
                          value={city}
                          onChange={(e) => handleCityChange(index, e.target.value)}
                          placeholder={`Ville ${index + 1}`}
                          required
                        />
                        {cities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCity(index)}
                            className="ml-2 p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCity}
                      className="flex items-center text-navy-600 hover:text-navy-800"
                    >
                      <Plus size={16} className="mr-1" />
                      Ajouter une ville
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="label">Hôtels</label>
                <div className="space-y-3">
                  {hotels.map((hotel, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-grow">
                        <input
                          type="text"
                          className="input"
                          value={hotel.name}
                          onChange={(e) => handleHotelChange(index, 'name', e.target.value)}
                          placeholder="Nom de l'hôtel"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <select
                          className="select"
                          value={hotel.stars}
                          onChange={(e) => handleHotelChange(index, 'stars', Number(e.target.value))}
                          required
                        >
                          <option value={1}>1 Étoile</option>
                          <option value={2}>2 Étoiles</option>
                          <option value={3}>3 Étoiles</option>
                          <option value={4}>4 Étoiles</option>
                          <option value={5}>5 Étoiles</option>
                        </select>
                      </div>
                      {hotels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHotel(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHotel}
                    className="flex items-center text-navy-600 hover:text-navy-800"
                  >
                    <Plus size={16} className="mr-1" />
                    Ajouter un hôtel
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="label">Dates de départ</label>
                <div className="space-y-3">
                  {departDates.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input w-40"
                        placeholder="Label (ex: 1er départ)"
                        value={d.label}
                        onChange={e => handleDepartDateChange(idx, 'label', e.target.value)}
                      />
                      <input
                        type="date"
                        className="input w-40"
                        value={d.date}
                        onChange={e => handleDepartDateChange(idx, 'date', e.target.value)}
                        required
                      />
                      <input
                        type="date"
                        className="input w-40"
                        value={d.dateRetour}
                        onChange={e => handleDepartDateChange(idx, 'dateRetour', e.target.value)}
                        required
                      />
                      {departDates.length > 1 && (
                        <button type="button" onClick={() => removeDepartDate(idx)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addDepartDate} className="flex items-center text-navy-600 hover:text-navy-800">
                    <Plus size={16} className="mr-1" /> Ajouter une date
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="label">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez le forfait voyage en détail"
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="imageUrl" className="label">URL de l'image principale</label>
                <input
                  type="text"
                  id="imageUrl"
                  className="input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  required
                />
                {imageUrl && (
                  <div className="mt-2 rounded-md overflow-hidden h-40">
                    <img 
                      src={imageUrl} 
                      alt="Image principale" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=URL+image+invalide';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Program & Inclusions */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="label">Programme journalier</label>
                <div className="space-y-3">
                  {dailyProgram.map((day, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-20">
                        <input
                          type="number"
                          className="input"
                          value={day.day}
                          onChange={(e) => handleProgramChange(index, 'day', Number(e.target.value))}
                          placeholder="Jour"
                          min={1}
                          required
                        />
                      </div>
                      <div className="flex-grow">
                        <textarea
                          className="textarea"
                          value={day.content}
                          onChange={(e) => handleProgramChange(index, 'content', e.target.value)}
                          placeholder="Activités et description de la journée"
                          rows={2}
                          required
                        ></textarea>
                      </div>
                      {dailyProgram.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProgramDay(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addProgramDay}
                    className="flex items-center text-navy-600 hover:text-navy-800"
                  >
                    <Plus size={16} className="mr-1" />
                    Ajouter un jour
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="label">Inclusions</label>
                  <div className="space-y-3">
                    {inclusions.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          className="input flex-grow"
                          value={item}
                          onChange={(e) => handleInclusionChange(index, e.target.value)}
                          placeholder="ex : Transferts aéroport"
                          required
                        />
                        {inclusions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInclusion(index)}
                            className="ml-2 p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addInclusion}
                      className="flex items-center text-navy-600 hover:text-navy-800"
                    >
                      <Plus size={16} className="mr-1" />
                      Ajouter une inclusion
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="label">Exclusions</label>
                  <div className="space-y-3">
                    {exclusions.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          className="input flex-grow"
                          value={item}
                          onChange={(e) => handleExclusionChange(index, e.target.value)}
                          placeholder="ex : Vols internationaux"
                          required
                        />
                        {exclusions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExclusion(index)}
                            className="ml-2 p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addExclusion}
                      className="flex items-center text-navy-600 hover:text-navy-800"
                    >
                      <Plus size={16} className="mr-1" />
                      Ajouter une exclusion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Pricing & Policies */}
          {activeTab === 3 && (
            <div className="space-y-6">
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
                      {pricingRules.map((rule) => (
                        <tr key={rule.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="input"
                              value={rule.minAge}
                              onChange={(e) => handlePricingRuleChange(rule.id, 'minAge', e.target.value)}
                              min={0}
                              max={120}
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="input"
                              value={rule.maxAge}
                              onChange={(e) => handlePricingRuleChange(rule.id, 'maxAge', e.target.value)}
                              min={0}
                              max={120}
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="input"
                              value={rule.price}
                              onChange={(e) => handlePricingRuleChange(rule.id, 'price', e.target.value)}
                              min={0}
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            {pricingRules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePricingRule(rule.id)}
                                className="p-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addPricingRule}
                  className="mt-3 flex items-center text-navy-600 hover:text-navy-800"
                >
                  <Plus size={16} className="mr-1" />
                  Ajouter une règle tarifaire
                </button>
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
                      {cancellationPolicy.map((policy) => (
                        <tr key={policy.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="input"
                              value={policy.minDaysBeforeDeparture}
                              onChange={(e) => handleCancellationPolicyChange(policy.id, 'minDaysBeforeDeparture', e.target.value)}
                              min={0}
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              className="input"
                              value={policy.refundPercent}
                              onChange={(e) => handleCancellationPolicyChange(policy.id, 'refundPercent', e.target.value)}
                              min={0}
                              max={100}
                              required
                            />
                          </td>
                          <td className="px-3 py-2">
                            {cancellationPolicy.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCancellationPolicy(policy.id)}
                                className="p-2 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addCancellationPolicy}
                  className="mt-3 flex items-center text-navy-600 hover:text-navy-800"
                >
                  <Plus size={16} className="mr-1" />
                  Ajouter une règle d'annulation
                </button>
              </div>
              
              <div className="form-group">
                <label htmlFor="totalSeats" className="label">Nombre total de places disponibles</label>
                <input
                  type="number"
                  id="totalSeats"
                  className="input"
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>
          )}
          
          {/* Types de chambres */}
          {activeTab === 1 && (
            <div className="form-group">
              <label className="label">Types de chambres</label>
              <div className="space-y-3">
                {roomTypes.map((rt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input w-32"
                      placeholder="Label (ex: Single)"
                      value={rt.label}
                      onChange={e => handleRoomTypeChange(idx, 'label', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      className="input w-24"
                      placeholder="Prix"
                      value={rt.price}
                      min={0}
                      onChange={e => handleRoomTypeChange(idx, 'price', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      className="input w-20"
                      placeholder="Capacité"
                      value={rt.capacity}
                      min={1}
                      onChange={e => handleRoomTypeChange(idx, 'capacity', e.target.value)}
                      required
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={rt.pricePerPerson}
                        onChange={e => handleRoomTypeChange(idx, 'pricePerPerson', e.target.checked)}
                      />
                      Prix par personne
                    </label>
                    {roomTypes.length > 1 && (
                      <button type="button" onClick={() => removeRoomType(idx)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addRoomType} className="flex items-center text-navy-600 hover:text-navy-800">
                  <Plus size={16} className="mr-1" /> Ajouter un type de chambre
                </button>
              </div>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between">
            {activeTab > 1 ? (
              <button
                type="button"
                onClick={prevTab}
                className="btn-outline"
              >
                Précédent
              </button>
            ) : (
              <div></div>
            )}
            
            {activeTab < tabs.length ? (
              <button
                type="button"
                onClick={nextTab}
                className="btn-primary"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary flex items-center"
              >
                <Save size={18} className="mr-2" />
                Créer l'offre
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminOfferCreate;