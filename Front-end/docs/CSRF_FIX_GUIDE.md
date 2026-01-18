# CSRF Token Mismatch - Solution & Fix

## Problem

```
Login error: Error: CSRF token mismatch.
    at Module.login (authService.js:52:11)
```

When attempting to login, Laravel rejects the request with a CSRF token mismatch error, even though `/sanctum/csrf-cookie` was called before login.

## Root Causes

1. **CORS Configuration**: The CORS config had `allowed_origins: ['*']` with `supports_credentials: true`, which is invalid. You cannot use wildcard origins when handling credentials.

2. **Missing CSRF Middleware**: The API middleware stack didn't explicitly include CSRF verification middleware.

3. **Token Extraction**: The frontend wasn't properly extracting the CSRF token from the cookie and sending it in request headers.

4. **Missing Sessions Table**: The database didn't have a `sessions` table, which is required for database-based session management.

## Solutions Implemented

### 1. Fixed CORS Configuration

**File**: `backend/config/cors.php`

**Changed from:**

```php
'allowed_origins' => ['*'],
'exposed_headers' => [],
'supports_credentials' => true,
```

**Changed to:**

```php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
'exposed_headers' => ['X-CSRF-Token'],
'supports_credentials' => true,
```

**Why**: When using credentials, you must specify exact origins. The `X-CSRF-Token` exposure allows the browser to send the token in requests.

### 2. Added CSRF Middleware to API Stack

**File**: `backend/bootstrap/app.php`

**Changed from:**

```php
$middleware->api([
    EnsureFrontendRequestsAreStateful::class,
    StartSession::class,
]);
```

**Changed to:**

```php
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

$middleware->api([
    EnsureFrontendRequestsAreStateful::class,
    StartSession::class,
    VerifyCsrfToken::class,
]);
```

**Why**: Explicitly applying CSRF verification ensures all POST requests have valid CSRF tokens.

### 3. Improved CSRF Token Extraction

**File**: `frontend/src/services/api.js`

Added a proper CSRF token extraction function and request interceptor:

```javascript
const getCsrfTokenFromCookie = () => {
  const name = "XSRF-TOKEN";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
};

api.interceptors.request.use((config) => {
  const csrfToken = getCsrfTokenFromCookie();
  if (csrfToken) {
    config.headers["X-CSRF-TOKEN"] = csrfToken;
  }
  return config;
});
```

**Why**: This ensures every API request includes the CSRF token from the cookie in the `X-CSRF-TOKEN` header.

### 4. Updated AuthService CSRF Cookie Handler

**File**: `frontend/src/services/authService.js`

```javascript
export const getCsrfCookie = async () => {
  try {
    const response = await api.get("/sanctum/csrf-cookie");

    // Extract CSRF token from response headers if available
    const csrfToken = response.headers["x-csrf-token"];
    if (csrfToken) {
      api.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
    }
  } catch (error) {
    console.error("Failed to get CSRF cookie:", error);
    throw error;
  }
};
```

**Why**: Captures the CSRF token response and makes it available for subsequent requests.

### 5. Created Sessions Table Migration

**File**: `backend/database/migrations/2026_01_17_000000_create_sessions_table.php`

Created the required `sessions` table for storing session data:

```php
Schema::create('sessions', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->foreignId('user_id')->nullable()->index();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->longText('payload');
    $table->integer('last_activity')->index();
});
```

### 6. Cleared Configuration Cache

```bash
php artisan config:clear
```

**Why**: Ensures Laravel reloads the CORS configuration from the .env file.

## How CSRF Protection Now Works

1. **Frontend initiates login:**

   ```javascript
   await getCsrfCookie(); // Calls GET /sanctum/csrf-cookie
   ```

2. **Backend returns CSRF cookie:**

   - Sets `XSRF-TOKEN` cookie (HttpOnly)
   - Frontend can read from `document.cookie`

3. **Axios interceptor extracts token:**

   - Reads `XSRF-TOKEN` from cookies
   - Adds to every request header as `X-CSRF-TOKEN`

4. **Frontend sends login credentials:**

   ```javascript
   await api.post("/api/login", {
     email: credentials.email,
     password: credentials.password,
     // X-CSRF-TOKEN header automatically added by interceptor
   });
   ```

5. **Backend verifies:**

   - `VerifyCsrfToken` middleware checks token
   - If valid, continues to login
   - Sets session cookie in response

6. **Frontend receives session:**
   - Browser stores `LARAVEL_SESSION` cookie (HttpOnly)
   - All subsequent requests include it automatically
   - No need for manual token management

## Testing the Fix

### 1. Verify CSRF Cookie Endpoint

```bash
curl -i http://localhost:8000/sanctum/csrf-cookie
```

Should see:

```
Set-Cookie: XSRF-TOKEN=eyJpdiI6I...
Set-Cookie: LARAVEL_SESSION=eyJpdiI6I...
```

### 2. Test Login with Browser DevTools

1. Open browser console
2. Clear cookies
3. Execute in console:

```javascript
// Get CSRF cookie
fetch("http://localhost:8000/sanctum/csrf-cookie", {
  credentials: "include",
})
  .then(() => {
    // Login with credentials
    return fetch("http://localhost:8000/api/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCsrfToken(), // From your cookie extraction function
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "password",
      }),
    });
  })
  .then((r) => r.json())
  .then(console.log);
```

### 3. Frontend App

Simply try logging in normally - it should now work.

## Environment Configuration Reference

**Backend (.env):**

```
SESSION_DRIVER=database
SESSION_CONNECTION=mysql
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_HTTP_ONLY=true
SESSION_SECURE_COOKIE=false
SESSION_SAME_SITE=lax
```

**CORS (config/cors.php):**

- `paths`: Include both `api/*` and `sanctum/csrf-cookie`
- `allowed_origins`: Specify exact frontend URLs
- `supports_credentials`: Always `true` for Sanctum
- `exposed_headers`: Include `X-CSRF-Token`

## Security Notes

✅ **HttpOnly Cookies**: Session cookies can't be accessed by JavaScript - protects against XSS
✅ **CSRF Tokens**: GET request to `/sanctum/csrf-cookie` creates CSRF token
✅ **SameSite Policy**: Set to `lax` to prevent cross-site cookie leakage
✅ **Explicit CORS Origins**: Prevents requests from unauthorized domains

⚠️ **Development Note**: `SESSION_SECURE_COOKIE=false` for localhost. In production, set to `true` to require HTTPS.

## Common Issues & Troubleshooting

| Issue                                | Cause                                | Solution                                              |
| ------------------------------------ | ------------------------------------ | ----------------------------------------------------- |
| CSRF token mismatch                  | Cookie not being sent                | Ensure `withCredentials: true` on axios               |
| Cookie not visible in DevTools       | HttpOnly flag set                    | This is correct - see Application tab instead         |
| "Invalid credentials" after CSRF fix | User doesn't exist or wrong password | Check database - user must be in `utilisateurs` table |
| Session not persisting               | Sessions table missing               | Run `php artisan migrate`                             |
| CORS error in console                | Frontend URL not in allowed_origins  | Update config/cors.php                                |

## Reference Links

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [CSRF Protection](https://laravel.com/docs/csrf)
- [Cookies & Sessions](https://laravel.com/docs/session)
- [CORS Configuration](https://laravel.com/docs/cors)
