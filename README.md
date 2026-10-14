# NexEvent — Unified College Event Management Hub

[![Production Build](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![React](https://img.shields.io/badge/React-19-blue)]()
[![Express](https://img.shields.io/badge/Express-5-lightgrey)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-cyan)]()

A high-performance, modern full-stack web application designed for campus student councils, university administrations, volunteers, and students to discover, RSVP, scan QR passes, and manage college events seamlessly.

---

## Architecture Overview

- **Frontend**: React 19 + Vite + TailwindCSS + Lucide Icons + Canvas Confetti
- **Backend**: Node.js + Express 5 REST API + JWT Authentication + Mongoose ODM
- **Database**: MongoDB (Atlas or local instance)
- **Deployment**: Supports unified single-server hosting (Render, Railway, VPS, Docker) or decoupled architecture (Vercel / Netlify frontend + Render backend).

---

## Default Seeded Accounts

The application automatically verifies and seeds the following accounts upon server startup:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@email.com` | `password@123` | Full event creation/editing, attendee analytics, announcements, check-in |
| **Volunteer** | `volunteer@college.edu` | `volunteer@123` | Fast QR ticket scanner simulator, check-in verification, shift desk |
| **Student** | `student@college.edu` | `student@123` | Event registration, digital QR ticket passes, certificate viewing |

---

## Local Development Setup

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy the example files and configure your secrets:

**Server (`server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/event_management
JWT_SECRET=your-super-secret-key-2026
CLIENT_URL=http://localhost:5173
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Application
Run server and client concurrently or in separate terminals:

**Server:**
```bash
npm run server
```
*API will run on [http://localhost:5000](http://localhost:5000)*

**Client:**
```bash
npm run client
```
*Web application will open on [http://localhost:5173](http://localhost:5173)*

---

## Deployment Guides

### Option 1: Monolithic Deployment (Render / Railway / VPS) — Recommended
In this approach, Express serves both the REST API and the compiled React production bundle from `client/dist`.

1. **Build & Start commands**:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
2. **Environment Variables**:
   - `NODE_ENV=production`
   - `PORT=5000` (or leave default provider port)
   - `MONGODB_URI=<Your MongoDB Atlas connection string>`
   - `JWT_SECRET=<A strong random secret>`
3. **One-Click Render Blueprint**:
   The repository includes a ready-to-use [`render.yaml`](./render.yaml). You can connect your GitHub repository to Render and deploy via "Blueprint".

---

### Option 2: Decoupled Deployment (Vercel Frontend + Render Backend)

#### A. Backend on Render:
1. Create a Web Service pointing to the `server/` directory or root repository.
2. Root directory: `server`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Set `CLIENT_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`).

#### B. Frontend on Vercel / Netlify:
1. Import repository on Vercel.
2. Framework Preset: **Vite**
3. Root Directory: `client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
7. SPA routing is automatically pre-configured with [`client/vercel.json`](./client/vercel.json) and [`client/public/_redirects`](./client/public/_redirects).

---

### Option 3: Docker & Docker Compose

Deploy locally or on any cloud VPS (DigitalOcean, AWS EC2, Linode) in one command:

```bash
docker compose up -d --build
```

Access the application at [http://localhost:5000](http://localhost:5000).

---

## Health Check & Monitoring

NexEvent includes a built-in health probe endpoint for cloud load balancers and uptime monitors:

- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "online",
    "database": "MongoDB",
    "system": "NexEvent College Event Management System",
    "timestamp": "2026-10-14T05:00:00.000Z"
  }
  ```

---

## Verification & Quality Assurance

- **Linting**:
  ```bash
  npm run lint
  ```
  *(Passes with 0 errors and 0 warnings)*

- **Production Build**:
  ```bash
  npm run build
  ```
  *(Compiles clean optimized bundle in `< 2s`)*
