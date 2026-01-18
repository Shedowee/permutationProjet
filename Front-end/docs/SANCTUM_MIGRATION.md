# JWT to Sanctum Migration - Complete Implementation Guide

## Overview

Successfully migrated from JWT (tokens in localStorage) to Laravel Sanctum with HttpOnly session cookies. The backend is now the **single source of truth** for authentication.

---

## Key Changes

### 1. **Authentication State Management**

- **Removed:** Redux auth slice, localStorage token storage
- **Added:** `AuthContext` (React Context API) for global auth state
- **Location:** [src/auth/context/AuthContext.jsx](src/auth/context/AuthContext.jsx)

### 2. **API Configuration**

- **File:** [src/services/api.js](src/services/api.js)
- **Critical Setting:** `withCredentials: true`
  - Automatically includes HttpOnly cookies in every request
  - Cookies are managed by the browser, not JavaScript

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  withCredentials: true, // Sends/receives cookies automatically
});
```

### 3. **Authentication Service**

- **File:** [src/services/authService.js](src/services/authService.js)
- **Endpoints:**
  - `GET /sanctum/csrf-cookie` - Get CSRF token (called before login)
  - `POST /api/login` - Login (backend sets HttpOnly cookie)
  - `POST /api/logout` - Logout (backend invalidates session)
  - `GET /api/me` - Get current authenticated user (backend source of truth)

### 4. **Protected Routes**

- **File:** [src/routes/ProtectedRoute.jsx](src/routes/ProtectedRoute.jsx)
- **Changes:**
  - Uses `useAuth()` hook instead of Redux
  - Waits for loading state to complete
  - Validates user role against `allowedRoles`
  - Redirects based on role if unauthorized

### 5. **Login Flow**

- **File:** [src/auth/pages/Login.jsx](src/auth/pages/Login.jsx)
- **Flow:**
  1. User submits credentials
  2. Get CSRF cookie: `GET /sanctum/csrf-cookie`
  3. Login: `POST /api/login` (sets HttpOnly cookie)
  4. Fetch user: `GET /api/me` (backend validates session)
  5. Redirect based on role

### 6. **App Root**

- **File:** [src/App.jsx](src/App.jsx)
- **Changes:**
  - Removed Redux dispatch for `checkAuthStatus`
  - AuthContext handles initial auth check on mount
  - Routes are protected via `ProtectedRoute` component

### 7. **Providers**

- **File:** [src/app/providers.jsx](src/app/providers.jsx)
- **Order matters:**
  1. Redux Provider (for non-auth state)
  2. AuthProvider (for authentication context)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│         Frontend Application                 │
│  (React + Vite + TailwindCSS)               │
└─────────────┬───────────────────────────────┘
              │
              ├─────────────┐
              │             │
         AuthContext    Redux Store
         (Auth State)   (Other State)
              │             │
              └─────────────┴─────────────┐
                                          │
                           ┌──────────────┴──────────────┐
                           │                             │
                     api.js (axios)               Browser Storage
                   withCredentials: true              (NONE)
                           │
              ┌────────────┴────────────┐
              │                         │
        POST /api/login          GET /api/me
        POST /api/logout         (Backend Truth)
        GET /sanctum/csrf-cookie
              │
┌─────────────┴────────────────────────────────┐
│        Laravel Backend (Sanctum)              │
│  - HttpOnly Session Cookies                   │
│  - CSRF Protection                            │
│  - Role-based Access Control                  │
└───────────────────────────────────────────────┘
```

---

## Critical Concepts

### ✅ What Changed

| Aspect               | Before (JWT)          | After (Sanctum)                    |
| -------------------- | --------------------- | ---------------------------------- |
| **Token Storage**    | localStorage          | HttpOnly Cookies (browser managed) |
| **State Management** | Redux auth slice      | React Context (AuthContext)        |
| **Auth Source**      | Frontend (JWT decode) | Backend (/api/me)                  |
| **CSRF Protection**  | Manual handling       | Automatic (Sanctum)                |
| **Cookie Handling**  | Manual                | Automatic (withCredentials)        |
| **Page Refresh**     | Lost token            | Session persists via cookie        |

### ❌ Removed Code Patterns

```javascript
// NO LONGER USED:
- localStorage.getItem('token')
- localStorage.setItem('token', ...)
- state.auth.token
- useSelector(selectToken)
- dispatch(checkAuthStatus) from Redux
```

### ✅ New Code Patterns

```javascript
// USE INSTEAD:
import { useAuth } from "@/auth/context/AuthContext";

const { user, role, loading, login, logout } = useAuth();

// Login
await login({ email: "user@example.com", password: "password" });

// Check auth
if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;

// Get user role
console.log(role); // 'admin', 'commission', 'formateur'
```

---

## Backend Requirements (Laravel Sanctum)

Ensure your Laravel backend has:

### 1. **CORS Configuration** (`config/cors.php`)

```php
'allowed_origins' => ['http://localhost:5173'], // Your frontend URL
'supports_credentials' => true, // Allow credentials
```

### 2. **Sanctum Middleware**

```php
// In routes/api.php:
Route::middleware('sanctum:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Or use EnsureFrontendRequestsAreStateful for cookie auth:
Route::middleware(['web', 'api'])->group(...);
```

### 3. **Login Endpoint** (`POST /api/login`)

```php
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (Auth::attempt($request->only('email', 'password'))) {
        // Session is automatically created by Laravel
        return response()->json([
            'user' => Auth::user()->load('role'), // Include role
        ]);
    }

    return response()->json(['error' => 'Invalid credentials'], 401);
}
```

### 4. **Me Endpoint** (`GET /api/me`)

```php
public function me()
{
    if (!Auth::check()) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    return response()->json([
        'user' => Auth::user()->load('role'), // Include role
    ]);
}
```

### 5. **Logout Endpoint** (`POST /api/logout`)

```php
public function logout()
{
    Auth::logout();
    return response()->json(['message' => 'Logged out']);
}
```

---

## Frontend Environment Configuration

Create `.env` in frontend root:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Optional: Debug mode
REACT_APP_DEBUG=false
```

Update `vite.config.js` if needed:

```javascript
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

---

## File Structure After Refactoring

```
src/
├── auth/
│   ├── context/
│   │   └── AuthContext.jsx         ✨ NEW: Global auth state
│   ├── pages/
│   │   └── Login.jsx               ✏️  UPDATED: Uses AuthContext
│   └── redux/
│       └── authSlice.js            ⚠️  DEPRECATED: Can be removed
├── routes/
│   └── ProtectedRoute.jsx          ✏️  UPDATED: Uses AuthContext
├── services/
│   ├── api.js                      ✏️  UPDATED: withCredentials
│   ├── auth.js
│   └── authService.js              ✏️  UPDATED: Clean Sanctum calls
├── app/
│   ├── providers.jsx               ✏️  UPDATED: Added AuthProvider
│   └── store.js
├── App.jsx                         ✏️  UPDATED: Removed Redux auth logic
├── main.jsx
└── index.css
```

---

## Testing Checklist

### ✅ Authentication Flow

- [ ] Login with valid credentials → redirects to dashboard
- [ ] Login with invalid credentials → shows error
- [ ] Page refresh while logged in → stays on page (session persists)
- [ ] Session expires → redirect to login
- [ ] Logout → clears auth state, redirect to login

### ✅ Role-Based Access

- [ ] Admin can access `/admin/*` routes
- [ ] Commission can access `/commission/*` routes
- [ ] Formateur can access `/formateur/*` routes
- [ ] Wrong role accessing wrong route → redirects to correct dashboard

### ✅ Protected Routes

- [ ] Unauthenticated users redirected to `/login`
- [ ] `ProtectedRoute` shows loading spinner during auth check
- [ ] Role validation works correctly

### ✅ Cookies

- [ ] DevTools → Application → Cookies shows `XSRF-TOKEN` and session cookie
- [ ] HttpOnly flag is set (can't access from JS)
- [ ] Cookies sent with every API request (withCredentials: true)

---

## Debugging Tips

### Issue: 401 Unauthorized on API calls

**Solutions:**

1. Check CORS configuration on backend
2. Verify `withCredentials: true` in api.js
3. Ensure backend returns proper session cookie
4. Check browser cookies in DevTools

### Issue: CSRF token missing

**Solution:**

- Ensure `getCsrfCookie()` is called before login
- AuthContext already does this in `login()` method

### Issue: Loading spinner stuck

**Solution:**

- Check network tab for errors on `/api/me` call
- Ensure `/api/me` endpoint returns 401 if not authenticated

### Issue: Role not loaded

**Solution:**

- Verify backend `/api/me` returns `user.role`
- Check AuthContext extracts role: `response.user?.role`

---

## Migration Complete! 🎉

You now have:
✅ Cookie-based authentication (Sanctum)  
✅ No localStorage token storage  
✅ Backend as source of truth  
✅ Role-based route protection  
✅ Session persistence on page refresh  
✅ Clean, maintainable code structure

---

## Next Steps (Optional Improvements)

1. **Add refresh token rotation** (if needed for long sessions)
2. **Implement logout on 401** (auto-redirect to login if session expires)
3. **Add auth state persistence** (refetch on tab focus)
4. **Implement user profile update** (without re-login)
5. **Add "Remember Me"** (optional, keep session longer)

---

## Support

For questions on Sanctum:

- [Laravel Sanctum Docs](https://laravel.com/docs/sanctum)
- [CORS in Sanctum](https://laravel.com/docs/sanctum#cors)
- [Session-based APIs](https://laravel.com/docs/sanctum#protecting-routes)

For React Context:

- [React Context API](https://react.dev/reference/react/useContext)
- [useContext Hook](https://react.dev/reference/react/useContext)
