const express = require('express');
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');
const jwt = require('jsonwebtoken');
const router = express.Router();

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

// Créer un paiement (agence)
router.post('/', authMiddleware('agency'), async (req, res) => {
  const { reservationId, amount, method, proofUrl, type } = req.body;
  const payment = new Payment({
    reservation: reservationId,
    amount,
    method,
    proofUrl,
    type,
    status: 'pending',
  });
  await payment.save();
  // Ajouter le paiement à l'historique de la réservation
  const reservation = await Reservation.findById(reservationId);
  if (reservation) {
    reservation.payments.push(payment._id);
    await reservation.save();
  }
  res.status(201).json(payment);
});

// Lister tous les paiements (admin) avec filtres avancés
router.get('/', authMiddleware('admin'), async (req, res) => {
  const { status, method, agency, client, from, to } = req.query;
  let match = {};
  if (status) match.status = status;
  if (method) match.method = method;
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }
  // Pipeline d'aggregation pour filtrer sur les champs de la réservation
  let pipeline = [
    { $lookup: { from: 'reservations', localField: 'reservation', foreignField: '_id', as: 'reservation' } },
    { $unwind: '$reservation' },
    { $match: match },
  ];
  if (agency) pipeline.push({ $match: { 'reservation.agency': agency } });
  if (client) pipeline.push({ $match: { 'reservation.clientName': { $regex: client, $options: 'i' } } });
  const payments = await Payment.aggregate(pipeline);
  res.json(payments);
});

// Détail d'un paiement
router.get('/:id', authMiddleware(), async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('reservation');
  if (!payment) return res.status(404).json({ message: 'Paiement non trouvé' });
  res.json(payment);
});

// Admin : approuver/refuser un paiement (support cash)
router.post('/:id/validate', authMiddleware('admin'), async (req, res) => {
  const { status, validationNote } = req.body; // 'approved' ou 'rejected', note optionnelle
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Paiement non trouvé' });
  // Pour cash, pas besoin de proofUrl, mais on garde la note
  if (payment.method === 'cash' && status === 'approved') {
    payment.status = 'approved';
    payment.validatedBy = req.user.id;
    if (validationNote) payment.validationNote = validationNote;
    await payment.save();
  } else if ((payment.method === 'card' || payment.method === 'bank') && status === 'approved' && !payment.proofUrl) {
    return res.status(400).json({ message: 'Justificatif requis pour ce type de paiement.' });
  } else {
    payment.status = status;
    payment.validatedBy = req.user.id;
    if (validationNote) payment.validationNote = validationNote;
    await payment.save();
  }

  // Mise à jour du montant payé/restant et du statut de la réservation liée
  if (payment.reservation) {
    const reservation = await Reservation.findById(payment.reservation).populate('offer').populate('payments');
    if (reservation) {
      // On ne prend en compte que les paiements validés
      const payments = await Payment.find({ reservation: reservation._id, status: 'approved' });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      reservation.montantPayé = totalPaid;
      reservation.resteAPayer = Math.max(0, (reservation.totalPrice || 0) - totalPaid);
      if (reservation.resteAPayer > 0 && totalPaid > 0) {
        reservation.status = 'partial_paid';
      } else if (reservation.resteAPayer <= 0) {
        reservation.status = 'paid';
        if (reservation.offer && reservation.offer.availableSeats > 0) {
          reservation.offer.availableSeats -= 1;
          await reservation.offer.save();
        }
      } else {
        reservation.status = 'pending';
      }
      await reservation.save();
    }
  }

  res.json({ message: `Paiement ${status}` });
});

// Supprimer un paiement (admin)
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Paiement supprimé' });
});

// Reporting synthétique sur les paiements
router.get('/report', authMiddleware('admin'), async (req, res) => {
  // Total encaissé, nombre de paiements validés, par agence, par méthode
  const total = await Payment.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  const byMethod = await Payment.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$method', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  const byAgency = await Payment.aggregate([
    { $match: { status: 'approved' } },
    { $lookup: { from: 'reservations', localField: 'reservation', foreignField: '_id', as: 'reservation' } },
    { $unwind: '$reservation' },
    { $group: { _id: '$reservation.agency', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
  res.json({
    total: total[0] || { totalAmount: 0, count: 0 },
    byMethod,
    byAgency
  });
});

module.exports = router; 