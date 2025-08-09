// Helper pour la tarification automatique HI-RUSSIA

function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function findPricingRule(pricingRules, age) {
  return pricingRules.find(rule => age >= rule.minAge && age <= rule.maxAge);
}

function getRoomType(roomTypes, label) {
  return roomTypes.find(rt => rt.label === label);
}

/**
 * Calcule le prix final pour chaque client et le total de la réservation
 * @param {Array} clients - [{ birthDate, roomTypeSelected }]
 * @param {Array} pricingRules - [{ minAge, maxAge, price }]
 * @param {Array} roomTypes - [{ label, price, capacity, pricePerPerson }]
 * @returns {Object} { clientsWithPrice, totalReservationPrice }
 */
function calculateReservationPrice(clients, pricingRules, roomTypes) {
  // Regrouper les clients par type de chambre
  const roomGroups = {};
  clients.forEach(client => {
    if (!roomGroups[client.roomTypeSelected]) roomGroups[client.roomTypeSelected] = [];
    roomGroups[client.roomTypeSelected].push(client);
  });

  let total = 0;
  const clientsWithPrice = [];

  for (const [roomLabel, group] of Object.entries(roomGroups)) {
    const roomType = getRoomType(roomTypes, roomLabel);
    if (!roomType) continue;
    if (roomType.pricePerPerson) {
      // Prix par personne
      group.forEach(client => {
        const age = calculateAge(client.birthDate);
        const rule = findPricingRule(pricingRules, age);
        const base = rule ? rule.price : 0;
        const prixFinal = base + roomType.price;
        clientsWithPrice.push({ ...client, prixFinal });
        total += prixFinal;
      });
    } else {
      // Prix par chambre (à diviser)
      const prixChambre = roomType.price;
      group.forEach(client => {
        const age = calculateAge(client.birthDate);
        const rule = findPricingRule(pricingRules, age);
        const base = rule ? rule.price : 0;
        const prixFinal = base + (prixChambre / group.length);
        clientsWithPrice.push({ ...client, prixFinal });
        total += prixFinal;
      });
    }
  }
  return { clientsWithPrice, totalReservationPrice: Math.round(total) };
}

module.exports = {
  calculateAge,
  findPricingRule,
  getRoomType,
  calculateReservationPrice,
}; 