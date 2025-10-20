# CORS Configuration Guide

## The Issue

You're seeing this error:

```
Cross-Origin Request blocked: CORS header 'Access-Control-Allow-Origin' missing. Status: 301
```

This happens because:

1. Your PocketBase server needs to allow requests from your frontend
2. The 301 status suggests HTTP → HTTPS redirect

## Solution 1: Update PocketBase URL to HTTPS

In your `.env` file:

```env
# Change from:
VITE_POCKETBASE_URL=http://pb.matzeschneider.de

# To:
VITE_POCKETBASE_URL=https://pb.matzeschneider.de
```

Then restart your dev server:

```bash
npm run dev
```

## Solution 2: Configure CORS in PocketBase

1. Open PocketBase Admin UI: `https://pb.matzeschneider.de/_/`
2. Login as admin
3. Go to **Settings** → **Application**
4. Find **Allowed origins** field
5. Add your frontend URLs (one per line):

   ```
   http://localhost:5173
   http://127.0.0.1:5173
   https://your-production-domain.com
   ```

6. Click **Save changes**

## Solution 3: Check PocketBase Server Configuration

If running your own PocketBase server, ensure it's configured correctly:

```bash
# Start PocketBase with proper settings
./pocketbase serve --http="0.0.0.0:8090"
```

## About Authentication

### You DON'T Need Authentik

The app now works with **password-only authentication**. OAuth buttons are commented out.

### What You Need

1. **PocketBase running** ✅ (You have this at pb.matzeschneider.de)
2. **CORS configured** ⚠️ (Fix with solutions above)
3. **Collections created** (See POCKETBASE_SCHEMA.md)

### What You DON'T Need

- ❌ Authentik server
- ❌ OAuth configuration
- ❌ External identity provider

## Test After Fixing CORS

1. Update `.env` to use HTTPS
2. Restart dev server: `npm run dev`
3. Go to <http://localhost:5173>
4. Try to sign up with email/password
5. Should work without CORS errors!

## If Still Not Working

Check browser console (F12) for detailed error messages and verify:

- [ ] PocketBase is accessible at the URL in `.env`
- [ ] HTTPS is used (not HTTP)
- [ ] CORS origins include `http://localhost:5173`
- [ ] No firewall blocking the connection

## Quick Test

Test PocketBase connection directly:

```bash
curl https://pb.matzeschneider.de/api/health
```

Should return: `{"code":200,"message":"API is healthy"}`
