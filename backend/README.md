# Backend (Laravel 12 + Sanctum)

## Overview
- Laravel 12 (PHP 8.2+), Sanctum for cookie-based session auth
- Vite build pipeline with Tailwind CSS
- API endpoints consumed by the React front-end

## Prerequisites
- PHP 8.2+, Composer
- Node.js 18+ and npm
- MySQL/MariaDB (or SQLite for local dev)

## Initial Setup
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --force
npm install
npm run build
```

## Development
Option A — use Composer script (server + queue + logs + Vite dev):
```bash
composer run dev
```

Option B — run services individually:
```bash
php artisan serve
php artisan queue:listen --tries=1
php artisan pail --timeout=0
npm run dev
```

## Testing
```bash
php artisan test
```

## Auth & CORS
- Sanctum stateful domains (in `.env`):
  - `SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:5173`
- Front-end must send requests with `withCredentials: true`
- Middleware ensures stateful session for API routes

## Key Endpoints
- Auth: `GET /sanctum/csrf-cookie`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
- Admin: `/api/roles`, `/api/logs`, `/api/parametres`
- Data: `/api/etablissements`

## Build
```bash
npm run build
```

## Notes
- Tailwind config via Vite plugin and resources/css/app.css
- See routing in [routes/api.php](routes/api.php) and middleware in [bootstrap/app.php](bootstrap/app.php)
