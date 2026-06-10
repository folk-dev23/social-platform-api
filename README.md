# 🐾 Popular Monsters

A modern social media platform built for portfolio purposes.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Cache:** Redis
- **Auth:** JWT
- **Storage:** Cloudinary
- **Deployment:** Docker, Nginx, VPS

## Getting Started

### Prerequisites
- Node.js v18+
- Docker Desktop

### Run locally
```bash
# Clone the repo
git clone https://github.com/yourusername/popular-monsters.git
cd popular-monsters

# Start database & cache
docker-compose up -d

# Start backend
cd backend
npm install
npm run dev

# Start frontend
cd ../frontend
npm install
npm run dev
```

## Project Structure