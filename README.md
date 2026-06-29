# All India Advocates Associations (AIAA) — Platform


## 1. Local setup

### Prerequisites
- Node.js 20+
- A MongoDB Atlas cluster (free tier is fine) — https://www.mongodb.com/cloud/atlas
- A Razorpay account in **test mode** — https://dashboard.razorpay.com/app/keys
- (Optional) An SMTP account for email confirmations (Gmail App Password works for testing)

### Backend
```bash
cd backend
COPY-ITEM .env.example .env       # fill in MONGO_URI, JWT secrets, Razorpay keys, SMTP
npm install
npm run seed                # loads the .env
npm run dev                 # http://localhost:5000
```

### Frontend
```bash
cd frontend
COPY-ITEM .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

Visit `http://localhost:3000`. Log in to `/admin` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD`
you set in `backend/.env`.

### Docker (alternative)
```bash
docker compose up --build
```

