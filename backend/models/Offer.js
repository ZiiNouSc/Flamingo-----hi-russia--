const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: String,
  stars: Number,
}, { _id: false });

const PricingRuleSchema = new mongoose.Schema({
  minAge: Number,
  maxAge: Number,
  price: Number,
}, { _id: false });

const CancellationPolicySchema = new mongoose.Schema({
  minDaysBeforeDeparture: Number,
  refundPercent: Number,
}, { _id: false });

const DailyProgramSchema = new mongoose.Schema({
  day: Number,
  content: String,
}, { _id: false });

const RoomTypeSchema = new mongoose.Schema({
  label: String,         // ex: "Single", "Double", "Triple"
  price: Number,         // Prix par personne ou par chambre
  capacity: Number,      // Nombre de personnes max
  pricePerPerson: Boolean // true = tarif par personne, false = par chambre
}, { _id: false });

const DepartDateSchema = new mongoose.Schema({
  label: String,
  date: String,
  dateRetour: String,
}, { _id: false });

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  country: String,
  cities: [String],
  hotels: [HotelSchema],
  departDates: [DepartDateSchema],
  description: String,
  dailyProgram: [DailyProgramSchema],
  inclusions: [String],
  exclusions: [String],
  pricingRules: [PricingRuleSchema],
  cancellationPolicy: [CancellationPolicySchema],
  totalSeats: Number,
  availableSeats: Number,
  alertThreshold: { type: Number, default: 5 },
  imageUrl: String,
  roomTypes: [RoomTypeSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Offer', OfferSchema); 