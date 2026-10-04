function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+\-()\s]{7,20}$/.test(phone.trim());
}

function isRequired(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined && value !== '';
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isRequired,
};
