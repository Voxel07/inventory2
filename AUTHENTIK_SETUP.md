# Authentik OAuth2 Setup Guide

This application uses **Authentik OAuth2** as the exclusive authentication method. No password-based login is available.

## Prerequisites

- ✅ PocketBase server running
- ✅ Authentik server running
- ✅ Admin access to both

---

## Step 1: Configure Authentik

### 1.1 Create OAuth2/OpenID Provider

1. Login to Authentik admin interface
2. Go to **Applications** → **Providers**
3. Click **Create**
4. Select **OAuth2/OpenID Provider**
5. Configure:
   - **Name**: `PocketBase Inventory`
   - **Authorization flow**: `default-provider-authorization-explicit-consent`
   - **Client type**: `Confidential`
   - **Client ID**: (will be auto-generated, copy this!)
   - **Client Secret**: (will be auto-generated, copy this!)
   - **Redirect URIs**: Add these URLs:

     ```
     http://127.0.0.1:8090/api/oauth2-redirect
     http://127.0.0.1:8090/_/
     https://pb.matzeschneider.de/api/oauth2-redirect
     https://pb.matzeschneider.de/_/
     ```

   - **Signing Key**: Select `authentik Self-signed Certificate`
6. Click **Create**

### 1.2 Create Application

1. Go to **Applications** → **Applications**
2. Click **Create**
3. Configure:
   - **Name**: `Inventory Management`
   - **Slug**: `inventory`
   - **Provider**: Select the provider you just created (`PocketBase Inventory`)
   - **Launch URL**: `http://localhost:5173` (or your frontend URL)
4. Click **Create**

### 1.3 Create Outpost (if needed)

If you're using embedded outpost:

1. Go to **Applications** → **Outposts**
2. Ensure your outpost is running and the application is assigned

---

## Step 2: Configure PocketBase

### 2.1 Enable OAuth2 Provider

1. Open PocketBase Admin UI: `https://pb.matzeschneider.de/_/`
2. Login as admin
3. Go to **Settings** → **Auth providers**
4. Click **+ Add new provider**
5. Configure:
   - **Provider**: `OAuth2`
   - **Enabled**: ✓
   - **Client ID**: (paste from Authentik)
   - **Client Secret**: (paste from Authentik)
   - **Auth URL**: `https://your-authentik-domain/application/o/authorize/`
   - **Token URL**: `https://your-authentik-domain/application/o/token/`
   - **User API URL**: `https://your-authentik-domain/application/o/userinfo/`
   - **Display name** (optional): `Authentik`
6. Click **Save**

**Important**: Note the exact provider name you use (e.g., "authentik", "oauth2"). You'll need this for the next step.

### 2.2 Update Frontend Configuration

In your `.env` file, update:

```env
VITE_POCKETBASE_URL=https://pb.matzeschneider.de
```

### 2.3 Configure CORS

Still in PocketBase Admin:

1. Go to **Settings** → **Application**
2. Find **Allowed origins**
3. Add your frontend URLs (one per line):

   ```
   http://localhost:5173
   http://127.0.0.1:5173
   https://your-production-domain.com
   ```

4. Click **Save changes**

---

## Step 3: Update OAuth Provider Name (if needed)

If your PocketBase OAuth provider is named differently than "authentik", update the code:

### In `src/contexts/AuthContext.tsx`

```typescript
const authData = await pb.collection('users').authWithOAuth2({
  provider: 'authentik', // Change this to match your provider name
  urlCallback: (url) => {
    window.location.href = url;
  },
});
```

### In `src/pages/SignupPage.tsx`

```typescript
await pb.collection('users').authWithOAuth2({
  provider: 'authentik', // Change this to match your provider name
  urlCallback: (url) => {
    window.location.href = url;
  },
});
```

To find your provider name:

1. Go to PocketBase Admin
2. Settings → Auth providers
3. Look at the provider you created - use that exact name

---

## Step 4: Test Authentication

1. Start your dev server:

   ```bash
   npm run dev
   ```

2. Open browser: `http://localhost:5173`

3. Click **"Sign in with Authentik"**

4. You should be redirected to Authentik login

5. After successful login, you'll be redirected back to the app

---

## Troubleshooting

### CORS Errors

**Error**: `Access-Control-Allow-Origin missing`

**Fix**:

1. Check PocketBase CORS settings include `http://localhost:5173`
2. Use HTTPS for PocketBase URL in `.env`

### OAuth Redirect Error

**Error**: `invalid_redirect_uri`

**Fix**:

1. Verify redirect URIs in Authentik match exactly
2. Add both:
   - `https://pb.matzeschneider.de/api/oauth2-redirect`
   - `https://pb.matzeschneider.de/_/`

### Provider Not Found

**Error**: `Failed to find OAuth2 provider "authentik"`

**Fix**:

1. Check provider name in PocketBase matches code
2. Ensure provider is **enabled** in PocketBase
3. Restart PocketBase server

### Invalid Client

**Error**: `invalid_client`

**Fix**:

1. Double-check Client ID and Secret in PocketBase
2. Ensure they match exactly from Authentik
3. No extra spaces or characters

---

## Authentication Flow

1. User clicks "Sign in with Authentik"
2. User is redirected to Authentik
3. User logs in with Authentik credentials
4. Authentik redirects back to PocketBase with auth code
5. PocketBase exchanges code for user info
6. User is created/updated in PocketBase users collection
7. User is redirected to app with JWT token
8. App stores token and user is logged in

---

## User Management

### First Admin User

The first user to sign in via OAuth will be a regular user. To make them admin:

1. Login to PocketBase Admin UI
2. Go to **Collections** → **users**
3. Find the user
4. Edit the record
5. Set `role` field to `admin`
6. Save

### Subsequent Users

- All OAuth users are automatically created in PocketBase
- Default role: `user`
- Admins can promote users to admin role via the Admin panel in the app

---

## Security Notes

- ✅ OAuth tokens are handled securely by PocketBase
- ✅ JWT tokens are stored in localStorage
- ✅ Auto-refresh on page load
- ✅ Role-based access control
- ✅ Admin-only routes protected

---

## Production Deployment

1. Update Authentik redirect URIs with production domain
2. Update `.env` with production PocketBase URL
3. Add production domain to PocketBase CORS settings
4. Ensure HTTPS for all URLs
5. Test OAuth flow in production

---

## Need Password Login?

If you want to re-enable password-based authentication:

1. Uncomment password login code in `LoginPage.tsx`
2. Uncomment password signup code in `SignupPage.tsx`
3. Add back `login` function to `AuthContext.tsx`

But for now, **OAuth with Authentik is your exclusive method**! 🔐
