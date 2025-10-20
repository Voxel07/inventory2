# Inventory Management System

A modern, full-featured inventory management system built with React, TypeScript, Material-UI, PocketBase, and Authentik OAuth.

## Features

- 🔐 **Authentication**: OAuth2 integration with Authentik and traditional email/password login
- 📦 **Inventory Management**: Track items with name, weight, price, and storage location
- 📊 **Stock Tracking**: Real-time stock changes with reason tracking and user attribution
- 🏢 **Storage Locations**: Organize items by storage locations
- 👥 **User Management**: Admin panel for user role management
- 🎨 **Modern UI**: Material-UI components with responsive design
- 🔒 **Protected Routes**: Role-based access control (Admin/User)

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI) v7
- **State Management**: React Context API
- **Routing**: React Router v7
- **Backend**: PocketBase
- **Authentication**: Authentik OAuth2 + PocketBase

## Prerequisites

- Node.js 18+ and npm
- PocketBase server running
- Authentik server running and configured

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_AUTHENTIK_CLIENT_ID=your_client_id
VITE_AUTHENTIK_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_AUTHENTIK_AUTHORIZE_URL=https://your-authentik-domain/application/o/authorize/
VITE_AUTHENTIK_TOKEN_URL=https://your-authentik-domain/application/o/token/
```

## PocketBase Setup

### Collections Configuration

Create the following collections in PocketBase:

#### 1. Users Collection (users)

- Default PocketBase collection
- Add custom field:
  - `role`: text (optional) - Values: "admin" or "user"

#### 2. Storage Locations Collection (storage_locations)

```
name: text (required)
description: text (optional)
```

#### 3. Items Collection (items)

```
name: text (required)
weight: number (required)
price: number (required)
storage_location: relation (required) -> storage_locations (single)
```

#### 4. Stock Changes Collection (stock_changes)

```
item: relation (required) -> items (single)
stock_change: number (required)
reason: text (required)
user: relation (required) -> users (single)
```

### OAuth2 Configuration in PocketBase

1. Go to Settings > Auth providers
2. Enable OAuth2 providers
3. Add Authentik as a provider:
   - Name: authentik
   - Client ID: (from Authentik)
   - Client Secret: (from Authentik)
   - Auth URL: `https://your-authentik-domain/application/o/authorize/`
   - Token URL: `https://your-authentik-domain/application/o/token/`

## Authentik Setup

1. Create a new OAuth2/OpenID Provider:
   - Name: PocketBase Inventory
   - Authorization flow: Authorization Code
   - Client Type: Confidential

2. Create a new Application:
   - Name: Inventory Management
   - Provider: Select the provider created above
   - Launch URL: `http://localhost:5173`

3. Configure Redirect URIs:
   - Add: `http://localhost:5173/auth/callback`
   - Add: `http://127.0.0.1:8090/_/auth/callback` (for PocketBase)

4. Copy the Client ID and Client Secret for configuration

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx              # Main layout with navigation
│   └── ProtectedRoute.tsx      # Route protection HOC
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   └── pocketbase.ts          # PocketBase client
├── pages/
│   ├── LoginPage.tsx          # Login with OAuth
│   ├── SignupPage.tsx         # User registration
│   ├── InventoryPage.tsx      # Inventory management
│   ├── AddItemPage.tsx        # Add items
│   ├── AddStorageLocationPage.tsx  # Add locations
│   └── AdminPage.tsx          # User management
├── types/
│   └── index.ts               # TypeScript types
├── App.tsx                     # Main app with routing
└── main.tsx                    # Entry point
```

## Usage Guide

### For Regular Users

1. **Login**: Use email/password or OAuth with Authentik
2. **View Inventory**: See all items with stock levels
3. **Add Items**: Create new inventory items
4. **Update Stock**: Record stock changes with reasons
5. **View History**: Check stock change logs
6. **Manage Locations**: Add storage locations

### For Admins

1. **User Management**: Access Admin panel
2. **Assign Roles**: Set users as admin or regular user
3. **Delete Users**: Remove users from the system

## API Integration

Uses PocketBase SDK for all operations:

- Authentication with OAuth2 and password
- CRUD operations on collections
- Relation expansion for linked data
- Real-time subscriptions (can be added)

## Troubleshooting

### PocketBase Connection

- Verify PocketBase is running
- Check CORS settings
- Confirm `VITE_POCKETBASE_URL` is correct

### OAuth Issues

- Verify Authentik configuration
- Check redirect URIs match
- Enable OAuth in PocketBase

### Build Issues

- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (18+)

## License

MIT
