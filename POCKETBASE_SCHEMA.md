# PocketBase Schema Setup Guide

This document describes the PocketBase database schema for the Inventory Management System.

## Collections

### 1. users (Built-in)

PocketBase's default users collection with custom fields added.

**Custom Fields:**

- `role` - Text (optional)
  - Options: "admin", "user"
  - Default: "user"

**API Rules:**

- List: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: Open (for registration)
- Update: `@request.auth.id = id`
- Delete: `@request.auth.role = "admin"`

---

### 2. storage_locations

Stores physical storage location information.

**Schema:**

```javascript
{
  name: "text" (required, unique),
  description: "text" (optional)
}
```

**API Rules:**

- List: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.role = "admin"`
- Delete: `@request.auth.role = "admin"`

---

### 3. items

Stores inventory item information.

**Schema:**

```javascript
{
  name: "text" (required),
  weight: "number" (required),
  price: "number" (required),
  storage_location: "relation" (required)
    - Collection: storage_locations
    - Type: Single
    - Display fields: name
    - Cascade delete: false (prevent deletion if items exist)
}
```

**Indexes:**

- Create index on `storage_location` for faster lookups

**API Rules:**

- List: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id != ""`
- Delete: `@request.auth.role = "admin"`

---

### 4. stock_changes

Tracks all stock changes for items.

**Schema:**

```javascript
{
  item: "relation" (required)
    - Collection: items
    - Type: Single
    - Display fields: name
    - Cascade delete: true (delete stock changes when item is deleted)
  
  stock_change: "number" (required)
    - Can be positive (stock in) or negative (stock out)
  
  reason: "text" (required)
    - Description of why stock changed
    - Examples: "Initial stock", "Sale", "Damaged", "Restocking"
  
  user: "relation" (required)
    - Collection: users
    - Type: Single
    - Display fields: name, email
    - Cascade delete: false
}
```

**Indexes:**

- Create index on `item` for faster lookups
- Create index on `user` for audit trails
- Create index on `created` for time-based queries

**API Rules:**

- List: `@request.auth.id != ""`
- View: `@request.auth.id != ""`
- Create: `@request.auth.id != "" && @request.auth.id = @request.data.user`
- Update: `@request.auth.role = "admin"`
- Delete: `@request.auth.role = "admin"`

---

## OAuth2 Configuration

### Authentik Provider Setup in PocketBase

1. Go to **Settings** > **Auth providers**
2. Click **Add new provider**
3. Configure:
   - **Provider**: OAuth2
   - **Name**: authentik
   - **Client ID**: (from Authentik application)
   - **Client Secret**: (from Authentik application)
   - **Auth URL**: `https://your-authentik-domain/application/o/authorize/`
   - **Token URL**: `https://your-authentik-domain/application/o/token/`
   - **User API URL**: `https://your-authentik-domain/application/o/userinfo/`
   - **Enabled**: ✓

---

## Collection Creation Scripts

You can use the PocketBase Admin UI or create collections programmatically.

### Example: Creating Collections via PocketBase Admin UI

1. **Storage Locations:**
   - Name: `storage_locations`
   - Type: Base
   - Add field: `name` (Text, Required, Unique)
   - Add field: `description` (Text, Optional)

2. **Items:**
   - Name: `items`
   - Type: Base
   - Add field: `name` (Text, Required)
   - Add field: `weight` (Number, Required)
   - Add field: `price` (Number, Required)
   - Add field: `storage_location` (Relation, Required, Single, → storage_locations)

3. **Stock Changes:**
   - Name: `stock_changes`
   - Type: Base
   - Add field: `item` (Relation, Required, Single, → items, Cascade delete)
   - Add field: `stock_change` (Number, Required)
   - Add field: `reason` (Text, Required)
   - Add field: `user` (Relation, Required, Single, → users)

---

## Sample Data

### Storage Locations

```json
[
  { "name": "Warehouse A - Shelf 1", "description": "Main warehouse, first shelf" },
  { "name": "Warehouse A - Shelf 2", "description": "Main warehouse, second shelf" },
  { "name": "Warehouse B - Floor", "description": "Secondary warehouse, floor storage" }
]
```

### Items

```json
[
  {
    "name": "Laptop - Dell XPS 15",
    "weight": 2.0,
    "price": 1299.99,
    "storage_location": "<storage_location_id>"
  },
  {
    "name": "Wireless Mouse",
    "weight": 0.1,
    "price": 29.99,
    "storage_location": "<storage_location_id>"
  }
]
```

### Stock Changes

```json
[
  {
    "item": "<item_id>",
    "stock_change": 50,
    "reason": "Initial stock",
    "user": "<user_id>"
  },
  {
    "item": "<item_id>",
    "stock_change": -5,
    "reason": "Sold to customer",
    "user": "<user_id>"
  }
]
```

---

## Queries and Calculations

### Get Current Stock for an Item

```javascript
// In your application
const stockChanges = await pb.collection('stock_changes').getFullList({
  filter: `item = "${itemId}"`
});

const currentStock = stockChanges.reduce((total, change) => {
  return total + change.stock_change;
}, 0);
```

### Get Stock History with User Details

```javascript
const history = await pb.collection('stock_changes').getFullList({
  filter: `item = "${itemId}"`,
  sort: '-created',
  expand: 'user'
});
```

### Get Items by Storage Location

```javascript
const items = await pb.collection('items').getFullList({
  filter: `storage_location = "${locationId}"`,
  expand: 'storage_location'
});
```

---

## Backup and Migration

### Export Schema

Use PocketBase's admin UI or API to export collection schemas.

### Backup Data

```bash
# PocketBase automatically creates backups
# Located in: pb_data/backups/
```

### Restore Data

```bash
# Copy backup to pb_data directory and restart PocketBase
```
