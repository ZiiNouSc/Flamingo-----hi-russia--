const express = require('express');
const Offer = require('../models/Offer');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Reservation = require('../models/Reservation');

function authMiddleware(role) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Non autorisé' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (role && decoded.role !== role) return res.status(403).json({ message: 'Accès refusé' });
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: 'Token invalide' });
    }
  };
}

// Créer une offre (admin)
router.post('/', authMiddleware('admin'), async (req, res) => {
  try {
    const offerData = req.body;
    // roomTypes peut être envoyé en JSON string (si formulaire), on parse si besoin
    if (typeof offerData.roomTypes === 'string') {
      offerData.roomTypes = JSON.parse(offerData.roomTypes);
    }
    const offer = new Offer(offerData);
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ message: 'Erreur création offre', error: err.message });
  }
});

// Lister toutes les offres
router.get('/', async (req, res) => {
  const offers = await Offer.find();
  res.json(offers);
});

// Détail d'une offre
router.get('/:id', async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offre non trouvée' });
  res.json(offer);
});

// Modifier une offre (admin)
router.put('/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const offerData = req.body;
    if (typeof offerData.roomTypes === 'string') {
      offerData.roomTypes = JSON.parse(offerData.roomTypes);
    }
    const offer = await Offer.findByIdAndUpdate(req.params.id, offerData, { new: true });
    res.json(offer);
  } catch (err) {
    res.status(400).json({ message: 'Erreur modification offre', error: err.message });
  }
});

// Supprimer une offre (admin)
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
  await Offer.findByIdAndDelete(req.params.id);
  res.json({ message: 'Offre supprimée' });
});

// Liste des réservations pour une offre
router.get('/:id/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find({ offer: req.params.id })
      .populate('agency')
      .populate('clients');
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations', error: err.message });
  }
});

module.exports = router; 