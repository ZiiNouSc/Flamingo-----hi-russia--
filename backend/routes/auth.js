const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware pour vérifier le token et le rôle
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

// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Identifiants invalides' });
  const valid = await user.comparePassword(password);
  if (!valid) return res.status(400).json({ message: 'Identifiants invalides' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, agencyName: user.agencyName } });
});

// Création d'utilisateur (par l'admin)
router.post('/create-user', authMiddleware('admin'), async (req, res) => {
  const { name, email, password, role, agencyName } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'Champs requis manquants' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email déjà utilisé' });
  const user = new User({ name, email, password, role, agencyName, isProfileComplete: false, isApproved: false });
  await user.save();
  res.status(201).json({ message: 'Utilisateur créé', user: { id: user._id, name, email, role, agencyName } });
});

// Récupérer l'utilisateur courant via le token
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const user = await require('../models/User').findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      agencyName: user.agencyName,
      address: user.address,
      rc: user.rc,
      phone: user.phone,
      isProfileComplete: user.isProfileComplete,
      isApproved: user.isApproved
    } });
  } catch {
    return res.status(401).json({ message: 'Token invalide' });
  }
});

// Lister tous les utilisateurs (admin)
router.get('/users', authMiddleware('admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Supprimer un utilisateur (admin)
router.delete('/users/:id', authMiddleware('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Utilisateur supprimé' });
});

// Créer un utilisateur (admin, RESTful)
router.post('/users', authMiddleware('admin'), async (req, res) => {
  const { name, email, password, role, agencyName } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'Champs requis manquants' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email déjà utilisé' });
  const user = new User({ name, email, password, role, agencyName, isProfileComplete: false, isApproved: false });
  await user.save();
  res.status(201).json({ message: 'Utilisateur créé', user: { id: user._id, name, email, role, agencyName } });
});

// Compléter ou modifier le profil agence
router.post('/agency/profile', authMiddleware('agency'), async (req, res) => {
  const userId = req.user.id;
  const { name, email, agencyName, address, rc, phone, password } = req.body;
  // Vérifier unicité de l'email si modifié
  if (email) {
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
  }
  const update = { name, email, agencyName, address, rc, phone, isProfileComplete: true };
  // Nettoyer les champs vides
  Object.keys(update).forEach(k => (update[k] === undefined ? delete update[k] : null));
  let user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  Object.assign(user, update);
  if (password) user.password = password;
  await user.save();
  res.json({ success: true });
});

// Approuver un compte agence (admin)
router.post('/users/:id/approve', authMiddleware('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  res.json({ success: true });
});

module.exports = router; 