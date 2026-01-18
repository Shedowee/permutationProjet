# JWT to Sanctum Authentication Refactoring - Complete

## ✅ Refactoring Complete!

Your React frontend has been successfully migrated from JWT authentication (tokens in localStorage) to **Laravel Sanctum with HttpOnly session cookies**.

### What Was Changed

#### 1. **Core Auth Infrastructure** (7 files modified/created)

| File                                                                 | Change        | Details                                          |
| -------------------------------------------------------------------- | ------------- | ------------------------------------------------ |
| [src/services/api.js](src/services/api.js)                           | ✏️ Updated    | Axios configured with `withCredentials: true`    |
| [src/auth/context/AuthContext.jsx](src/auth/context/AuthContext.jsx) | ✨ Created    | React Context replacing Redux auth logic         |
| [src/services/authService.js](src/services/authService.js)           | ✏️ Updated    | Clean Sanctum API calls (login, logout, /api/me) |
| [src/services/auth.js](src/services/auth.js)                         | ⚠️ Deprecated | Shows warnings, delegates to authService         |
| [src/routes/ProtectedRoute.jsx](src/routes/ProtectedRoute.jsx)       | ✏️ Updated    | Uses AuthContext, handles loading state          |
| [src/auth/pages/Login.jsx](src/auth/pages/Login.jsx)                 | ✏️ Updated    | Uses AuthContext, CSRF cookie flow               |
| [src/App.jsx](src/App.jsx)                                           | ✏️ Updated    | Removed Redux auth logic                         |
| [src/app/providers.jsx](src/app/providers.jsx)                       | ✏️ Updated    | Added AuthProvider wrapper                       |

#### 2. **Layout Components** (2 files updated)

| File                                                           | Change     | Details                                    |
| -------------------------------------------------------------- | ---------- | ------------------------------------------ |
| [src/shared/layouts/Layout.jsx](src/shared/layouts/Layout.jsx) | ✏️ Updated | Uses AuthContext instead of Redux for role |
| [src/shared/layouts/Navbar.jsx](src/shared/layouts/Navbar.jsx) | ✏️ Updated | Uses AuthContext logout, shows user email  |

---

## 🏗️ Architecture

### Before (JWT)

```
Browser Storage
    ↓ (localStorage)
JWT Token
    ↓ (Authorization header)
Redux Store (isAuthenticated, token, user)
    ↓ (useSelector)
Components
```

### After (Sanctum)

```
Browser Cookies
    ↓ (HttpOnly, managed by browser)
withCredentials: true
    ↓ (sent automatically)
AuthContext
    ↓ (useAuth hook)
Components
```

---

## 🔑 Key Implementation Details

### 1. API Configuration

```javascript
// ✅ src/services/api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  withCredentials: true, // CRITICAL: sends/receives cookies
});
```

### 2. Auth Context

```javascript
// ✅ src/auth/context/AuthContext.jsx
const {
  user, // null | { id, email, name, role }
  role, // 'admin' | 'commission' | 'formateur'
  loading, // true during auth checks
  isAuthenticated, // derived from user !== null
  login, // async (credentials) => user
  logout, // async () => void
  refetchUser, // async () => void
} = useAuth();
```

### 3. Login Flow

```javascript
// ✅ src/auth/pages/Login.jsx
const { login } = useAuth();

// Steps:
// 1. GET /sanctum/csrf-cookie (in AuthContext.login)
// 2. POST /api/login (sets HttpOnly session cookie)
// 3. GET /api/me (fetches user data)
// 4. Redirect based on role
await login({ email, password });
```

### 4. Protected Routes

```javascript
// ✅ src/routes/ProtectedRoute.jsx
<ProtectedRoute allowedRoles={["admin"]}>
  <AdminDashboard />
</ProtectedRoute>

// Auto:
// - Shows loading spinner while checking auth
// - Redirects to /login if not authenticated
// - Validates role
// - Redirects if wrong role
```

---

## 📋 Backend Checklist

Ensure your Laravel backend has:

### ✅ CORS Configuration

```php
// config/cors.php
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

### ✅ Auth Routes

```php
// routes/api.php
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
```

### ✅ Login Response

```php
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"  // ⚠️ MUST include role
  }
}
```

---

## 🚀 Usage Examples

### Check Authentication

```javascript
import { useAuth } from "@/auth/context/AuthContext";

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>Hello {user.email}</div>;
}
```

### Login

```javascript
async function handleLogin(email, password) {
  try {
    const user = await login({ email, password });
    // Auto redirect happens via useEffect
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}
```

### Logout

```javascript
async function handleLogout() {
  try {
    await logout();
    // Auto redirects to /login
  } catch (error) {
    console.error("Logout error:", error);
  }
}
```

### Check User Role

```javascript
const { role } = useAuth();

if (role === "admin") {
  // Show admin features
}
```

---

## 📚 Documentation Files

- **[SANCTUM_MIGRATION.md](SANCTUM_MIGRATION.md)** - Complete migration guide with architecture, requirements, and testing checklist
- **[AUTH_QUICK_REFERENCE.md](AUTH_QUICK_REFERENCE.md)** - Quick lookup guide for developers

---

## ⚠️ Important Notes

### NO More localStorage

```javascript
❌ localStorage.getItem('token')
❌ localStorage.setItem('token', ...)
❌ sessionStorage.getItem('auth')
```

### NO More Redux Auth

```javascript
❌ useSelector(selectAuthToken)
❌ useSelector(selectIsAuthenticated)
❌ dispatch(login(...))
❌ dispatch(logout())
```

### ALWAYS Use AuthContext

```javascript
✅ const { user, role, login, logout } = useAuth()
✅ axios with withCredentials: true
✅ Backend (/api/me) is source of truth
✅ Cookies managed by browser
```

---

## 🧪 Testing

### Manual Testing

1. **Login** → Verify redirect to dashboard
2. **Page Refresh** → Session should persist
3. **Wrong Credentials** → Error displayed
4. **Wrong Role** → Redirect to correct dashboard
5. **Logout** → Redirect to login
6. **Browser DevTools** → Check cookies are HttpOnly

### Automated Testing

```javascript
// Check that token is never accessed
expect(localStorage.getItem("token")).toBe(null);
expect(sessionStorage.getItem("auth")).toBe(null);

// Check cookies are HttpOnly (can't access from JS)
// Verify API calls include withCredentials
```

---

## 🔍 Debugging

### User Not Authenticating

- [ ] Check `/api/me` returns 401 if not authenticated
- [ ] Verify CORS allows credentials
- [ ] Check `withCredentials: true` in api.js
- [ ] Browser DevTools: Cookies tab shows session cookie

### Cookie Not Being Sent

- [ ] Check `withCredentials: true` in api.js
- [ ] Verify CORS header: `Access-Control-Allow-Credentials: true`
- [ ] Check cookie domain matches frontend domain

### Loading Spinner Stuck

- [ ] Check network tab for `/api/me` errors
- [ ] Look at browser console for JavaScript errors
- [ ] Verify backend `/api/me` endpoint exists

---

## 📦 File Structure

```
src/
├── auth/
│   ├── context/
│   │   └── AuthContext.jsx          ✨ NEW
│   ├── pages/
│   │   └── Login.jsx                ✏️  UPDATED
│   └── redux/
│       └── authSlice.js             ⚠️  DEPRECATED
├── routes/
│   └── ProtectedRoute.jsx           ✏️  UPDATED
├── services/
│   ├── api.js                       ✏️  UPDATED
│   ├── auth.js                      ⚠️  DEPRECATED
│   └── authService.js               ✏️  UPDATED
├── shared/layouts/
│   ├── Layout.jsx                   ✏️  UPDATED
│   └── Navbar.jsx                   ✏️  UPDATED
├── app/
│   ├── providers.jsx                ✏️  UPDATED
│   └── store.js                     (unchanged)
├── App.jsx                          ✏️  UPDATED
└── main.jsx                         (unchanged)
```

---

## ✨ Benefits

✅ **More Secure** - HttpOnly cookies can't be accessed by XSS  
✅ **Simpler Code** - No token management logic  
✅ **Better UX** - Session persists on page refresh  
✅ **Cleaner Architecture** - Backend is source of truth  
✅ **Standards Compliant** - Follows Laravel Sanctum best practices  
✅ **CSRF Protection** - Built into Sanctum

---

## 🎓 What You Learned

- How to migrate from JWT to session-based authentication
- Cookie-based authentication flow
- HttpOnly cookies for security
- React Context API for global state
- Sanctum architecture and integration
- Backend-frontend auth separation

---

## ❓ FAQ

**Q: Why not use Redux for auth?**  
A: AuthContext is better for auth - it's simpler, separates concerns, and doesn't require Redux serialization config.

**Q: Can I still use localStorage?**  
A: No. Cookies are automatic, safer, and sync across tabs.

**Q: What if session expires?**  
A: User gets 401 error, redirected to login. AuthContext handles this.

**Q: How do I refresh the user data?**  
A: Use `refetchUser()` from AuthContext. Or logout/login.

**Q: Can I use this with mobile apps?**  
A: This is for web browsers. Mobile apps need token-based Sanctum.

---

## 🎉 Done!

Your application now uses modern, secure, **Laravel Sanctum** authentication.

Start by:

1. Testing login/logout flow
2. Checking DevTools for HttpOnly cookies
3. Verifying role-based routing works
4. Reading `SANCTUM_MIGRATION.md` for details
5. Using `AUTH_QUICK_REFERENCE.md` as needed

**Happy coding!** 🚀
