require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connecté')).catch(err => console.error(err));

// Routes de test
app.get('/', (req, res) => {
  res.send('API Flamingo backend opérationnelle');
});

// TODO: Ajouter routes auth, offres, réservations, paiements

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/offers', require('./routes/offer'));
app.use('/api/reservations', require('./routes/reservation'));
app.use('/api/payments', require('./routes/payment'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur le port ${PORT}`);
}); 