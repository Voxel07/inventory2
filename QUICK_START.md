# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your PocketBase URL:

```bash
cp .env.example .env
```

### 3. Setup Backend

- Start PocketBase server
- Follow `POCKETBASE_SCHEMA.md` to create collections
- Configure OAuth2 provider (optional)

### 4. Run Application

```bash
npm run dev
```

Open: <http://localhost:5173>

---

## 📝 Daily Usage

### View Inventory

1. Login to the system
2. Main page shows all items with current stock

### Add New Item

1. Click "Add Item" in sidebar
2. Fill in: name, weight, price
3. Select storage location
4. Optionally add initial stock
5. Submit

### Update Stock

1. Go to Inventory page
2. Click edit icon on item
3. Enter stock change (+ or -)
4. Add reason
5. Submit

### Manage Storage Locations

1. Click "Storage Locations" in sidebar
2. Add new location with name and description

### Admin Tasks (Admin Only)

1. Click "Admin" in sidebar
2. View all users
3. Edit user roles (admin/user)
4. Delete users if needed

---

## 🔑 Default Roles

- **User**: Can view inventory, add items, update stock
- **Admin**: All user permissions + user management

---

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### File Structure

```
src/
├── components/    # Reusable components
├── contexts/      # React contexts
├── lib/          # External libraries config
├── pages/        # Page components
└── types/        # TypeScript types
```

---

## 📚 Documentation

- **README.md** - Full project documentation
- **POCKETBASE_SCHEMA.md** - Database schema details
- **PROJECT_SUMMARY.md** - Complete feature list

---

## 🐛 Common Issues

**Can't connect to PocketBase**

- Check PocketBase is running
- Verify `VITE_POCKETBASE_URL` in `.env`

**OAuth not working**

- Check Authentik configuration
- Verify redirect URIs match
- Enable OAuth provider in PocketBase

**Build errors**

- Run `npm install` again
- Check Node.js version (18+)
- Clear cache: `rm -rf node_modules package-lock.json`

---

## 🎯 Key Features

✅ OAuth2 Authentication (Authentik)
✅ Email/Password Login
✅ Inventory Management
✅ Stock Tracking with History
✅ Storage Location Management
✅ User Role Management (Admin)
✅ Responsive Design
✅ Material-UI Components

---

**Need Help?** Check the full documentation in README.md
