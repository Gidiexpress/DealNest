# DealNest MVP

A trust-first escrow platform for small remote jobs in Nigeria.

## Technologies
- **Backend:** Django 5, DRF, Celery, Redis, PostgreSQL
- **Frontend:** Next.js 15, Tailwind CSS, shadcn/ui
- **Infrastructure:** Docker Compose

## Prerequisites
- Docker & Docker Compose
- Paystack / Flutterwave Keys

## Setup Instructions

1. **Clone & Configure**
   - Rename `.env.example` to `.env` (or set env vars in `docker-compose.yml`).
   - Ensure you have gateway keys ready.

2. **Run with Docker**
   ```bash
   docker-compose up --build
   ```
   This will start:
   - Backend API (http://localhost:8000)
   - Frontend App (http://localhost:3000)
   - PostgreSQL (5432)
   - Redis (6379)
   - Celery Worker & Beat

3. **Initialize Database**
   Open a new terminal:
   ```bash
   # Enter backend container
   docker-compose exec backend bash
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   
   # Seed Initial Data (Admin, Test Users, Job Types)
   python manage.py seed_data
   ```

4. **Access Applications**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Admin Panel:** [http://localhost:8000/admin](http://localhost:8000/admin) (Login: admin/admin)
   - **API Docs:** [http://localhost:8000/api/](http://localhost:8000/api/)

## Testing
To run payment flow tests:
```bash
docker-compose exec backend python manage.py test payments
```

## Features
- **Escrow**: Funds held until delivery approved.
- **Paystack/Flutterwave**: Integrated payments.
- **Disputes**: Admin panel resolution.
- **Roles**: Client and Freelancer dashboards.
