# Bite of Bliss

Bite of Bliss is a bakery web project with a customer-facing site, admin management pages, and a Node.js + MongoDB backend API.

**📖 [Read the Complete Admin Guide](ADMIN_GUIDE.md)** - Learn how to set up admin accounts and manage your bakery!

## GitHub Pages

[![Deploy to GitHub Pages](https://github.com/TanveeerSingh/bite-of-bliss/actions/workflows/pages.yml/badge.svg)](https://github.com/TanveeerSingh/bite-of-bliss/actions/workflows/pages.yml)

Live site: [https://tanveeersingh.github.io/bite-of-bliss/](https://tanveeersingh.github.io/bite-of-bliss/)

Admin live: [https://tanveeersingh.github.io/bite-of-bliss/admin-portal/admin-login.html](https://tanveeersingh.github.io/bite-of-bliss/admin-portal/admin-login.html)

## Features

- Customer pages for browsing products and placing orders
- Authentication flow (signup/signin)
- Admin dashboard for order and inventory management
- Product and order APIs with role-based protection
- Blog section with 1 to 9 pages (including Coming Soon placeholders)

## Project Structure

```text
Bite_of_Blise-main 2/
├── index.html
├── signin.html
├── signup.html
├── stylesheet.css
├── blog1.html ... blog9.html
├── admin-portal/
├── shop/
├── images/
└── backend/
```

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs

## Run Locally

### 1) Frontend

Open `index.html` directly in browser, or serve the root folder with any static server.

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

Backend defaults:

- Port: `5001` (or `PORT` from `.env`)
- Mongo URI: `MONGO_URI` from `.env` (fallback: local MongoDB)

## Environment Variables (backend/.env)

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/bakeryDB
JWT_SECRET=your_secret_here
```

## API Overview

Base URL: `http://localhost:5001/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products` (admin)
- `PUT /products/:id` (admin)
- `DELETE /products/:id` (admin)
- `POST /products/bootstrap` (seed default products)

### Orders

- `POST /orders` (authenticated user)
- `GET /orders/my-orders` (authenticated user)
- `GET /orders` (admin)
- `PUT /orders/:id/status` (admin)
- `DELETE /orders/:id` (admin)

Auth header format:

```text
Authorization: Bearer <token>
```

## Website Preview

Open the main site pages here:

- [Homepage](index.html)
- [Sign In](signin.html)
- [Sign Up](signup.html)
- [Admin Login](admin-portal/admin-login.html)
- [Admin Dashboard](admin-portal/admin-dashboard.html)
- [Admin Orders](shop/admin-orders.html)

## Notes

- Admin-only endpoints require a user with role `admin`.
- To promote a user as admin, update that user record in MongoDB.

---

## 👨‍💼 Admin Access Guide

### How to Become an Admin

There are two ways to get admin access:

#### **Option 1: Manually Promote via MongoDB** (Recommended for testing)

1. **Sign up** as a regular customer on the website
2. **Access MongoDB**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com) → Your Cluster
   - Click "Collections" → `bakeryDB` → `users`
   - Find your user document
3. **Update the role**:
   - Change the `role` field from `"customer"` to `"admin"`
   - Save the changes
4. **Sign in to Admin Portal**:
   - Visit [Admin Login](admin-portal/admin-login.html)
   - Use the same email and password you signed up with
   - You now have full admin access!

#### **Option 2: Create Admin Account Directly** (For production)

```javascript
// Connect to MongoDB and run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@biteofbliss.com",
  password: "hashed_password_here", // Use bcryptjs to hash
  role: "admin",
  timestamps: new Date()
})
```

### What Admins Can Do

Once logged in as admin, access the **Admin Dashboard** to:

#### 📊 **Order Management**
- View all customer orders
- Update order status (pending → confirmed → preparing → delivered → cancelled)
- Delete orders if needed
- Export order data as CSV

#### 🍰 **Inventory Management**
- Add new bakery products
- Edit product details (name, price, description)
- Delete products
- Manage product availability

#### 🔐 **Admin Features**
- Real-time order updates
- Secure admin authentication
- Admin logout option

### Admin Portal URLs

- **Admin Login**: `/admin-portal/admin-login.html`
- **Admin Dashboard**: `/admin-portal/admin-dashboard.html`
- **Admin Orders View**: `/shop/admin-orders.html`

### Admin API Endpoints (Protected)

All admin endpoints require:
1. Valid JWT token from admin account
2. User role must be `"admin"`

**Header format**:
```
Authorization: Bearer <admin_token>
```

**Available Admin Routes**:

```
POST   /api/products              - Create product
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
GET    /api/orders                - View all orders
PUT    /api/orders/:id/status     - Update order status
DELETE /api/orders/:id            - Delete order
```

---
