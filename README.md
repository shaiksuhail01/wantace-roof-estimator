# Wantace Roof Estimator

A configuration-driven roofing estimator for **Northline Roofing & Exteriors**.

Customers can calculate a roofing estimate and submit their details as leads. Authenticated admins can manage questions, pricing, and configuration versions through the owner panel.

## Features

- Dynamic estimator questions and options
- Server-side estimate calculation
- Customer lead capture and management
- Admin authentication
- Configurable pricing and questions
- Configuration versioning and history
- Historical lead tracking
- Backend validation
- Calculator tests
- Responsive UI

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB
- **Authentication:** JWT + bcrypt

## Architecture

```text
React / Vite
     |
     v
Express API
     |
     +-- Authentication
     +-- Configuration
     +-- Calculator
     +-- Leads
     |
     v
MongoDB
```

MongoDB is the source of truth for questions, options, pricing, and configuration. Estimates are calculated on the backend.

## Local Setup

### Requirements

- Node.js 18+
- npm
- MongoDB

### 1. Clone

```bash
https://github.com/shaiksuhail01/wantace-roof-estimator.git
cd wantace-roof-estimator-monorepo
```

### 2. Install Dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd ../client
npm install
```

### 3. Environment Variables

Create:

```text
server/.env
```

Use `server/.env.example` as the template.

Example:

```env
PORT=5000
MONGO_URI=connection_string
JWT_SECRET=your_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
CLIENT_URL=http://localhost:5173
```

### 4. Seed Database

From the `server` directory:

```bash
npm run seed
```

### 5. Start Backend

From the `server` directory:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 6. Start Frontend

Create:

```text
client/.env
```

Use `client/.env.example` as the template.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Open another terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Admin Test Login

```text
Username: admin@northline.com
Password: roofing2026!
```

## API

### Public

```text
GET  /api/config
POST /api/estimate
```

### Authentication

```text
POST /api/auth/login
POST /api/auth/logout
```

### Protected Admin

```text
GET  /api/leads
GET  /api/leads/:id
GET  /api/admin/config
POST /api/admin/config
```

## Configuration & Versioning

Configuration is stored in MongoDB and published as versions.

```text
v3 -> historical
v4 -> historical
v5 -> active
```

Only one configuration is active at a time.

Each lead stores the configuration version used to generate its estimate, preserving historical traceability.

Calculator-required questions are:

```text
roof_area
material
pitch
layers
stories
```

The backend prevents a configuration from disabling or removing these required calculator inputs.

Additional non-pricing questions can be added without changing the calculator.



## Testing

Calculator tests cover:

- Valid estimate
- Minimum roof area
- Maximum roof area
- Invalid roof area
- Invalid material
- Invalid pitch
- Invalid layers
- Invalid stories

Run:

```bash
cd server
node src/services/calculator.test.js
```

Manual verification includes:

- Customer estimator flow
- Lead creation
- Admin authentication
- Protected API access
- Configuration editing
- Question activation/deactivation
- Adding questions
- Configuration publishing
- Configuration version history
- Historical leads
- MongoDB persistence

## Project Structure

```text
wantace-roof-estimator-monorepo/
|
+-- client/                  # React frontend
|
+-- server/                  # Express backend
|   +-- src/
|       +-- config/
|       +-- controllers/
|       +-- middleware/
|       +-- models/
|       +-- routes/
|       +-- seed/
|       +-- services/
|
+-- DECISIONS.md             # Engineering decisions
+-- AI_LOG.md                # AI development log
+-- README.md                # Project documentation
```

## Deployment

```text
Frontend -> Vercel 
Backend  -> Render 
Database -> MongoDB Atlas
```

**Public Estimator:** `https://wantace-roof-estimator-wheat.vercel.app`

**Admin Panel:** `https://wantace-roof-estimator-wheat.vercel.app/admin/login`

**Backend API:** `https://wantace-roof-estimator-api.onrender.com`

**Health Check:** `https://wantace-roof-estimator-api.onrender.com/api/health`
