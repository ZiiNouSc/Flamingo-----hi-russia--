const express = require('express');
const Reservation = require('../models/Reservation');
const Offer = require('../models/Offer');
const Payment = require('../models/Payment');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const priceCalculator = require('../helpers/priceCalculator');

// Middleware d'authentification
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

// Multer pour upload fichiers (modifié pour sous-dossier agence)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // On place le fichier dans un sous-dossier par agence
    let agencyId = req.user?.id || req.body.agencyId || 'default';
    // Si c'est une route d'upload de paiement, on prend agencyId depuis la réservation
    if (req.baseUrl.includes('reservations') && req.params.id) {
      Reservation.findById(req.params.id).then(reservation => {
        if (reservation && reservation.agency) {
          agencyId = reservation.agency.toString();
        }
        const dir = path.join(__dirname, '../uploads', agencyId);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      });
    } else {
      const dir = path.join(__dirname, '../uploads', agencyId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Créer une réservation (agence)
router.post('/', authMiddleware('agency'), upload.array('passportFiles'), async (req, res) => {
  try {
    let { offer: offerId, clients, departDateSelected, returnDateSelected } = req.body;
    // Correction : parser clients si c'est une string JSON
    let parsedClients = clients;
    if (typeof clients === 'string') {
      try {
        parsedClients = JSON.parse(clients);
      } catch (e) {
        return res.status(400).json({ message: 'Format des passagers invalide.' });
      }
    }
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'Offre non trouvée' });
    let clientsWithPrice = [];
    let totalReservationPrice = 0;
    if (parsedClients && Array.isArray(parsedClients) && parsedClients.length > 0) {
      const calc = priceCalculator.calculateReservationPrice(parsedClients, offer.pricingRules, offer.roomTypes);
      clientsWithPrice = calc.clientsWithPrice;
      totalReservationPrice = calc.totalReservationPrice;
    }
    // Empêcher de dépasser la capacité globale
    if (offer.totalSeats && clientsWithPrice.length > offer.availableSeats) {
      return res.status(400).json({ message: 'Capacité maximale atteinte pour cette offre.' });
    }
    const reservation = new Reservation({
      offer: offerId,
      agency: req.user.id,
      clients: clientsWithPrice,
      totalPrice: totalReservationPrice,
      status: 'pending',
      departDateSelected,
      returnDateSelected,
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ message: 'Erreur création réservation', error: err.message });
  }
});

// Lister les réservations (admin ou agence)
router.get('/', authMiddleware(), async (req, res) => {
  let filter = {};
  if (req.user.role === 'agency') filter.agency = req.user.id;
  const reservations = await Reservation.find(filter).populate('offer').populate('agency');
  res.json(reservations);
});

// Détail d'une réservation
router.get('/:id', authMiddleware(), async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('offer')
    .populate('agency')
    .populate({ path: 'payments', options: { sort: { createdAt: 1 } } });
  if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });
  if (req.user.role === 'agency' && reservation.agency._id.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
  res.json(reservation);
});

// Upload de justificatif de paiement
router.post('/:id/upload-proof', authMiddleware('agency'), upload.single('proof'), async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });
  reservation.paymentProof = `/uploads/${req.file.filename}`;
  await reservation.save();
  res.json({ message: 'Justificatif uploadé', url: reservation.paymentProof });
});

// Nouvelle route : upload de preuve de paiement (API attendue par le front)
router.post('/:id/payment', authMiddleware('agency'), upload.single('paymentProof'), async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé' });
  // On stocke le chemin relatif
  const agencyId = reservation.agency.toString();
  reservation.paymentProof = `/uploads/${agencyId}/${req.file.filename}`;
  // Force le statut à 'pending_payment' sauf si déjà payé ou rejeté
  if (reservation.status !== 'rejected' && reservation.status !== 'paid') {
    reservation.status = 'pending_payment';
  }
  console.log('Statut après upload:', reservation.status);
  await reservation.save();
  // On renvoie la réservation complète avec les infos peuplées
  const populated = await Reservation.findById(reservation._id).populate('offer').populate('agency');
  res.json(populated);
});

// Liste des réservations totalement payées
router.get('/paid', authMiddleware('admin'), async (req, res) => {
  const reservations = await Reservation.find({ status: 'paid' }).populate('offer').populate('agency');
  res.json(reservations);
});

// Liste des réservations non totalement payées
router.get('/unpaid', authMiddleware('admin'), async (req, res) => {
  const reservations = await Reservation.find({ $or: [ { status: 'pending_payment' }, { amountRemaining: { $gt: 0 } } ] }).populate('offer').populate('agency');
  res.json(reservations);
});

// Admin : approuver/refuser une réservation
router.post('/:id/validate', authMiddleware('admin'), async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate('offer').populate('payments');
  if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });

  // Si l'admin fournit un montant et un type, on crée un paiement validé même sans preuve
  const { type, montant } = req.body;
  if (type && typeof montant === 'number' && montant > 0) {
    // Création du paiement validé
    const payment = new Payment({
      reservation: reservation._id,
      amount: montant,
      method: 'cash', // par défaut, ou à adapter si besoin
      type,
      status: 'approved',
      validatedBy: req.user.id,
      validationNote: 'Ajout manuel par admin lors de la validation',
    });
    await payment.save();
    reservation.payments.push(payment._id);
    reservation.montantPayé = (reservation.montantPayé || 0) + montant;
    reservation.resteAPayer = Math.max(0, (reservation.totalPrice || 0) - reservation.montantPayé);
    if (reservation.resteAPayer > 0) {
      reservation.status = 'partial_paid';
    } else {
      reservation.status = 'paid';
      if (reservation.offer && reservation.offer.availableSeats > 0) {
        reservation.offer.availableSeats -= 1;
        await reservation.offer.save();
      }
    }
    await reservation.save();
    const populated = await Reservation.findById(reservation._id).populate('offer').populate('agency').populate({ path: 'payments', options: { sort: { createdAt: 1 } } });
    return res.json(populated);
  }

  // Sinon, logique existante (validation via paiements déjà enregistrés)
  const payments = await require('../models/Payment').find({ reservation: reservation._id, status: 'approved' });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  reservation.montantPayé = totalPaid;
  reservation.resteAPayer = Math.max(0, (reservation.totalPrice || 0) - totalPaid);
  if (reservation.montantPayé < (reservation.totalPrice || 0)) {
    reservation.status = reservation.montantPayé > 0 ? 'partial_paid' : 'pending';
    await reservation.save();
    return res.status(400).json({ message: 'Le montant payé est insuffisant pour valider la réservation. Un versement partiel a été enregistré.' });
  }
  reservation.status = 'paid';
  // Décrémenter une place sur l'offre si totalement payé
  if (reservation.offer && reservation.offer.availableSeats > 0) {
    reservation.offer.availableSeats -= 1;
    await reservation.offer.save();
  }
  await reservation.save();
  const populated = await Reservation.findById(reservation._id).populate('offer').populate('agency').populate({ path: 'payments', options: { sort: { createdAt: 1 } } });
  res.json(populated);
});

// Refuser une réservation (admin)
router.post('/:id/reject', authMiddleware('admin'), async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });
  reservation.status = 'rejected';
  await reservation.save();
  res.json(reservation);
});

// Supprimer une réservation (admin ou agence propriétaire)
router.delete('/:id', authMiddleware(), async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });
  if (req.user.role === 'agency' && reservation.agency.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Réservation supprimée' });
});

// PATCH : Modifier montantPayé et resteAPayer
router.patch('/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const { montantPayé, resteAPayer } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });
    if (typeof montantPayé === 'number') reservation.montantPayé = montantPayé;
    if (typeof resteAPayer === 'number') reservation.resteAPayer = resteAPayer;
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: err.message });
  }
});

// Réactiver une réservation rejetée (admin)
router.post('/:id/reactivate', authMiddleware('admin'), async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Réservation non trouvée' });
  if (reservation.status !== 'rejected') return res.status(400).json({ message: 'Seules les réservations rejetées peuvent être remises en attente.' });
  reservation.status = 'pending';
  await reservation.save();
  res.json(reservation);
});

module.exports = router; 