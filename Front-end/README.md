# Front-end (React + Vite)

## Overview
- React 19, Vite 7, React Router 7
- Authentication via Laravel Sanctum (HttpOnly cookies)
- Role-based protected routes for admin, commission, formateur
- Code splitting enabled with React.lazy and Suspense

## Prerequisites
- Node.js 18+ and npm
- Backend running (Laravel 12) with Sanctum configured for stateful domains

## Install
```bash
npm install
```

## Scripts
- Development: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview build: `npm run preview`

## Environment & Auth
- Front-end uses axios with `withCredentials: true`
- Backend must expose:
  - `GET /sanctum/csrf-cookie` for CSRF
  - `POST /api/login` to set session cookie
  - `GET /api/me` to retrieve the current user
- Sanctum stateful domains (backend `.env`):
  - `SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:5173`

## Key Routes
- `/login` public
- Admin: `/admin`, `/admin/users`, `/admin/roles`, `/admin/logs`, `/admin/etablissements`, `/admin/settings`
- Commission: `/commission`, `/commission/demandes`
- Formateur: `/formateur`, `/formateur/demandes`, `/formateur/demandes/create`

## Data Endpoints Used
- `/api/me`, `/api/login`, `/api/logout`
- `/api/roles`
- `/api/logs`
- `/api/parametres?type=STATUT_USER`
- `/api/etablissements`

## Files of Interest
- Routing: [App.jsx](src/App.jsx)
- Auth context: [AuthContext.jsx](src/auth/context/AuthContext.jsx), hook: [useAuth](src/auth/hooks/useAuth.js)
- Sidebar & Navbar: [Sidebar.jsx](src/shared/layouts/Sidebar.jsx), [Navbar.jsx](src/shared/layouts/Navbar.jsx)
- Admin pages: [AdminDashboard.jsx](src/features/admin/pages/AdminDashboard.jsx), [UserManagement.jsx](src/features/admin/pages/UserManagement.jsx), [AssignRoles.jsx](src/features/admin/pages/AssignRoles.jsx), [ViewLogs.jsx](src/features/admin/pages/ViewLogs.jsx), [EtablissementManagement.jsx](src/features/admin/pages/EtablissementManagement.jsx), [Settings.jsx](src/features/admin/pages/Settings.jsx)

## Build & Verify
```bash
npm run lint
npm run build
npm run preview
```

