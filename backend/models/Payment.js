const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['card', 'bank', 'cash'], required: true },
  type: { type: String, enum: ['acompte', 'solde', 'total', 'remboursement'], required: true },
  proofUrl: String, // URL du justificatif uploadé
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin
  validationNote: { type: String }, // note ou justification lors d'une validation cash
  comment: { type: String }, // commentaire ou note optionnelle
});

module.exports = mongoose.model('Payment', PaymentSchema); 