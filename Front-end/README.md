# OFPPT Gestion Permutation - Frontend

Modern React frontend for OFPPT permutation management system with Laravel Sanctum authentication.

## 📁 Project Structure

```
Frontend/
├── docs/                          # Documentation
│   ├── AUTH_QUICK_REFERENCE.md   # Quick reference for auth
│   ├── SANCTUM_MIGRATION.md      # Full Sanctum integration guide
│   └── REFACTORING_SUMMARY.md    # What changed during migration
├── src/
│   ├── auth/                      # Authentication
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state (React Context)
│   │   └── pages/
│   │       └── Login.jsx          # Login form
│   ├── features/                  # Feature modules
│   │   ├── admin/                 # Admin dashboard & features
│   │   ├── commission/            # Commission features
│   │   └── formateur/             # Formateur features
│   ├── routes/
│   │   ├── AppRouter.jsx          # Main router setup
│   │   └── ProtectedRoute.jsx     # Role-based route protection
│   ├── services/                  # API & business logic
│   │   ├── api.js                 # Axios instance (withCredentials)
│   │   └── authService.js         # Auth API calls
│   ├── shared/                    # Reusable components
│   │   ├── components/            # UI components (Button, Card, Modal, etc.)
│   │   ├── constants/             # App constants
│   │   └── layouts/               # Layout components (Navbar, Sidebar, etc.)
│   ├── app/                       # App configuration
│   │   ├── providers.jsx          # Redux + Auth providers
│   │   └── store.js               # Redux store setup
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── .env                           # Environment variables (local)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── README.md                      # This file
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.js              # PostCSS config
└── index.html                     # HTML entry point
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env` from `.env.example`:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Optional: Debug mode
VITE_DEBUG=false
```

## 🔐 Authentication

Uses **Laravel Sanctum** with HttpOnly cookies (no JWT tokens in localStorage).

### Key Components

- **AuthContext** (`src/auth/context/AuthContext.jsx`) - Global auth state
- **useAuth hook** - Access auth state and methods
- **ProtectedRoute** (`src/routes/ProtectedRoute.jsx`) - Role-based route protection
- **authService** (`src/services/authService.js`) - Backend API calls

### Usage

```javascript
import { useAuth } from "@/auth/context/AuthContext";

function MyComponent() {
  const { user, role, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

See [docs/AUTH_QUICK_REFERENCE.md](docs/AUTH_QUICK_REFERENCE.md) for more details.

## 📚 Documentation

- **[Sanctum Migration Guide](docs/SANCTUM_MIGRATION.md)** - Complete authentication architecture
- **[Auth Quick Reference](docs/AUTH_QUICK_REFERENCE.md)** - Quick lookup for developers
- **[Refactoring Summary](docs/REFACTORING_SUMMARY.md)** - What changed during JWT→Sanctum migration

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Redux Toolkit** - State management (non-auth)
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library

## 📦 Key Dependencies

- `react` - Core React library
- `react-router-dom` - Client-side routing
- `redux` & `@reduxjs/toolkit` - State management
- `axios` - HTTP requests
- `tailwindcss` - Utility-first CSS
- `@heroicons/react` - Icon library

## 🎯 Features

### Admin Dashboard

- User management
- Role assignment
- Establishment management
- Logs & audit trail
- System statistics

### Commission Dashboard

- Review permutation requests
- Approve/reject with comments
- Track request status
- Commission statistics

### Formateur Dashboard

- Create permutation requests
- Track request status
- View personal requests
- Download documentation

## 🔄 Role-Based Access

Three roles with different permissions:

- **admin** - Full system access
- **commission** - Review & approve requests
- **formateur** - Create & manage personal requests

Protected routes automatically redirect based on role.

## 🐛 Troubleshooting

### Build fails with module errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Auth not working

- Check `.env` has correct `VITE_API_URL`
- Ensure backend CORS allows credentials
- Check browser DevTools for HttpOnly cookies

### Styles not loading

```bash
# Rebuild Tailwind CSS
npm run build
```

## 📝 Development Tips

### Add a new feature

1. Create folder in `src/features/`
2. Add pages, components, redux slices
3. Import in routing setup
4. Add ProtectedRoute with role checks

### Add a new route

```javascript
// In src/App.jsx
<Route
  path="/admin/new"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### Access auth state

```javascript
import { useAuth } from "@/auth/context/AuthContext";

const { user, role, login, logout } = useAuth();
```

## ✅ Backend Requirements

Your Laravel backend must have:

- ✅ Sanctum configured
- ✅ `/api/login` endpoint
- ✅ `/api/logout` endpoint
- ✅ `/api/me` endpoint (returns user with role)
- ✅ CORS allowing credentials
- ✅ `EnsureFrontendRequestsAreStateful` middleware

See backend README for setup instructions.

---

**Last Updated:** January 2026  
**Auth System:** Laravel Sanctum + React Context  
**Status:** Production Ready
