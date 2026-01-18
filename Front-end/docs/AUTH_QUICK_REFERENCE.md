# Sanctum Authentication - Quick Reference

## Use the `useAuth` Hook

```javascript
import { useAuth } from "@/auth/context/AuthContext";

function MyComponent() {
  const { user, role, loading, login, logout } = useAuth();

  // Don't render until auth is loaded
  if (loading) return <div>Loading...</div>;

  // Check if authenticated
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>Role: {role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## `useAuth()` Hook API

```javascript
const {
  // State
  user, // Current user object (null if not authenticated)
  role, // User role ('admin', 'commission', 'formateur')
  loading, // Boolean - true during auth checks
  error, // Last authentication error message
  isAuthenticated, // Boolean - true if user is logged in

  // Methods
  login, // async (credentials) => user
  logout, // async () => void
  refetchUser, // async () => void - refresh user data
} = useAuth();
```

## Login Example

```javascript
async function handleLogin(email, password) {
  try {
    const user = await login({ email, password });
    // Backend response: { id, email, name, role, ... }
    console.log("Logged in as:", user.email);
    // Auto redirect happens via useEffect
  } catch (error) {
    console.error("Login failed:", error.message);
  }
}
```

## Logout Example

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

## Check User Role

```javascript
import { useAuth } from "@/auth/context/AuthContext";

function AdminOnly() {
  const { role } = useAuth();

  if (role !== "admin") {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}
```

## Protected Routes

Routes are protected automatically via `ProtectedRoute`:

```javascript
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

The component will:

1. Show loading spinner while auth is checking
2. Redirect to login if not authenticated
3. Redirect to correct dashboard if wrong role

## Access User Data

```javascript
const { user } = useAuth();

// Available properties (depends on your backend response)
console.log(user.id);
console.log(user.email);
console.log(user.name);
console.log(user.role);
// ... other fields from /api/me endpoint
```

## API Calls (Manual)

If you need to call API directly (not recommended):

```javascript
import * as authService from "@/services/authService";

// Get CSRF cookie (needed before login)
await authService.getCsrfCookie();

// Login
const result = await authService.login({ email, password });

// Logout
await authService.logout();

// Get current user
const response = await authService.getCurrentUser();
console.log(response.user);
```

## API Configuration

The axios instance (`api.js`) is pre-configured:

```javascript
import api from "@/services/api";

// This already includes withCredentials for cookies
api.get("/api/some-endpoint"); // Cookie sent automatically
api.post("/api/some-endpoint", data); // Cookie sent automatically
```

**Do NOT manually add Authorization headers** - the cookie is handled by the browser.

## Common Patterns

### Show Loading State

```javascript
const { loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}
```

### Check if Admin

```javascript
const { role } = useAuth();

if (role === "admin") {
  // Show admin features
}
```

### Redirect if Not Authenticated

```javascript
const { user } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (!user) {
    navigate("/login");
  }
}, [user]);
```

### Redirect Based on Role

```javascript
const { role } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (role === "admin") {
    navigate("/admin");
  } else if (role === "formateur") {
    navigate("/formateur");
  }
}, [role]);
```

## Troubleshooting

### User is `null` but should be authenticated

- Check that `/api/me` endpoint returns user data
- Verify backend is setting session cookie correctly
- Check CORS configuration allows credentials

### Cookie not being sent

- Ensure `withCredentials: true` in api.js
- Check CORS header: `Access-Control-Allow-Credentials: true`
- Verify cookie domain matches frontend domain

### Loading spinner stuck forever

- Check network tab for errors on `/api/me`
- Ensure `/api/me` returns 401 if not authenticated
- Check browser console for JavaScript errors

### Role not available

- Verify backend `/api/me` response includes `user.role`
- Check `AuthContext` extracts role: `response.user?.role`
- Look at network response to confirm role is sent

## DO NOT DO

```javascript
❌ localStorage.getItem('token')
❌ localStorage.setItem('token', ...)
❌ useSelector(selectAuthToken)
❌ dispatch(checkAuthStatus)
❌ axios with Authorization header
```

## DO THIS INSTEAD

```javascript
✅ const { user, role } = useAuth()
✅ await login(credentials)
✅ await logout()
✅ axios with withCredentials: true
```

## Redux vs Auth Context

- **Redux (store.js):** For app state (admin data, forms, etc.)
- **AuthContext (AuthContext.jsx):** For authentication only

Don't put authentication in Redux - use AuthContext for cleaner separation of concerns.

## File Locations

- **Auth Context:** `src/auth/context/AuthContext.jsx`
- **Auth Service:** `src/services/authService.js`
- **API Config:** `src/services/api.js`
- **Protected Routes:** `src/routes/ProtectedRoute.jsx`
- **Login Page:** `src/auth/pages/Login.jsx`
- **Providers:** `src/app/providers.jsx`

---

**Questions?** See `SANCTUM_MIGRATION.md` for full documentation.
