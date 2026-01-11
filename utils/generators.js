const crypto = require('crypto');

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

const generateAPIKey = () => {
  return 'uauth_' + crypto.randomBytes(32).toString('hex');
};

const hashAPIKey = (apiKey) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

module.exports = {
  generateOTP,
  generateAPIKey,
  hashAPIKey
};
