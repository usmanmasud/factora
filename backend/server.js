require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { checkAndAlertLowStock } = require('./controllers/smsController');

const app = express();
connectDB();

app.use(cors({
  origin: [
    'https://frontend-psi-beryl-43.vercel.app',
    'http://localhost:3000'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/sms', require('./routes/sms'));
app.use('/api/ussd', require('./routes/ussd'));
app.use('/api/airtime', require('./routes/airtime'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/orders', require('./routes/orders'));

// Run low-stock check every 10 minutes
setInterval(checkAndAlertLowStock, 10 * 60 * 1000);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Factora backend running on port ${PORT}`));
