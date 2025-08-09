const mongoose = require('mongoose');

const PassengerSchema = new mongoose.Schema({
  name: String,
  birthdate: String,
  calculatedPrice: Number,
}, { _id: false });

const ClientSchema = new mongoose.Schema({
  fullName: String,
  birthDate: String,
  passport: String,
  roomTypeSelected: String,
  prixFinal: Number,
}, { _id: false });

const ReservationSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passengers: [PassengerSchema],
  clients: [ClientSchema],
  status: { type: String, enum: ['pending', 'partial_paid', 'paid', 'rejected', 'cancelled'], default: 'pending' },
  totalPrice: Number,
  montantPayé: { type: Number, default: 0 },
  resteAPayer: { type: Number, default: 0 },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  createdAt: { type: Date, default: Date.now },
  passportFiles: [String],
  paymentProof: String,
  departDateSelected: String,
  returnDateSelected: String,
});

module.exports = mongoose.model('Reservation', ReservationSchema); 