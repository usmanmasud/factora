# Factora

Industrial coordination platform for African manufacturers — powered by Africa's Talking APIs.

## Features
- **SMS Alerts** — Downtime, restock, and task alerts to workers
- **USSD Orders** — Distributors place & track orders from any phone (`*384*12345#`)
- **Airtime Rewards** — Reward distributors with airtime for sales reporting
- **Insights Dashboard** — Real-time order, inventory, and alert analytics

## Stack
- Frontend: React + Recharts
- Backend: Node.js + Express
- Database: MongoDB
- APIs: Africa's Talking (SMS, USSD, Airtime)

## Setup

### 1. Backend
```bash
cd backend
cp .env .env.local   # edit with your AT sandbox credentials
npm install
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/factora
AT_API_KEY=your_sandbox_api_key
AT_USERNAME=sandbox
AT_SENDER_ID=FACTORA
AT_SHORTCODE=*384*12345#
```

## Africa's Talking Setup (Sandbox)
1. Sign up at [account.africastalking.com](https://account.africastalking.com)
2. Create a sandbox app → copy API Key
3. Set USSD callback URL to: `http://your-server/api/ussd/callback`
4. Use the AT Simulator to test USSD sessions

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sms/send` | Send SMS alert |
| GET | `/api/sms` | Alert history |
| POST | `/api/ussd/callback` | USSD handler (AT callback) |
| POST | `/api/airtime/send` | Send airtime reward |
| GET | `/api/airtime/logs` | Airtime log |
| GET | `/api/insights` | Dashboard analytics |
| GET/POST | `/api/inventory` | Manage inventory |
| GET/POST | `/api/workers` | Manage workers |
| GET | `/api/orders` | List orders |
| PATCH | `/api/orders/:id/status` | Update order + SMS notify |
