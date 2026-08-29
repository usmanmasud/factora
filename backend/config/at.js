const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

module.exports = {
  sms: at.SMS,
  airtime: at.AIRTIME,
};
