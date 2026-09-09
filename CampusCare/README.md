# CampusCare

A full-stack student grievance redressal system built with React + Vite, Node.js + Express, PostgreSQL + Prisma, JWT authentication, role-based authorization, and Cloudinary image uploads.

## Features
- Student registration/login
- Admin login with role-based authorization
- Secure password hashing with bcrypt
- JWT access tokens
- Student dashboard with complaint submission and image attachment
- Complaint tracking: Pending, In Progress, Resolved, Rejected
- Admin dashboard with filters, search, status updates and complaint details
- Responsive modern UI
- PostgreSQL database through Prisma ORM
- Cloudinary uploads for complaint proof images
- Production-ready API and frontend configuration

## Stack
- Frontend: React, Vite, React Router, Axios, Lucide React
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Uploads: Cloudinary
- Deployment: Vercel (frontend) + Render/Railway (backend) + Neon/Supabase PostgreSQL

## Local setup

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Backend defaults to `http://localhost:5000` and frontend to `http://localhost:5173`.

### Demo admin
- Email: `admin@campuscare.local`
- Password: `Admin@12345`

Change the password before production use.

## Production deployment
1. Create a PostgreSQL database on Neon, Supabase, Railway, or Render.
2. Add backend environment variables from `backend/.env.example`.
3. Run `npx prisma migrate deploy` during the backend build/deploy step.
4. Deploy `backend` as a Node web service.
5. Deploy `frontend` as a Vite app on Vercel/Netlify.
6. Set `VITE_API_URL` to the deployed backend URL + `/api`.
7. Set `CLIENT_URL` on the backend to the deployed frontend URL.
8. Configure Cloudinary credentials if image uploads are required.

The repository is intentionally split into `frontend` and `backend` so it can be deployed independently.
