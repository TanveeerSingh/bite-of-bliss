# Backend API (Bite of Bliss)

Express + MongoDB backend that powers authentication, product management, and order flows.

## Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing

## Run Backend

```bash
cd backend
npm install
npm run dev
```

Production start:

```bash
npm start
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/bakeryDB
JWT_SECRET=your_secret_here
```

## API Routes

Base URL: `http://localhost:5001/api`

### Auth

- `POST /auth/register`
  - body: `{ name, email, password }`
- `POST /auth/login`
  - body: `{ email, password }`

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products` (admin only)
- `PUT /products/:id` (admin only)
- `DELETE /products/:id` (admin only)
- `POST /products/bootstrap` (seed initial products)

### Orders

- `POST /orders` (authenticated user)
  - body: `{ items: [{ productId, quantity }], shippingAddress }`
- `GET /orders/my-orders` (authenticated user)
- `GET /orders` (admin only)
- `PUT /orders/:id/status` (admin only)
  - body: `{ status }`
- `DELETE /orders/:id` (admin only)

## Authorization Header

```text
Authorization: Bearer <token>
```

## Promote User to Admin

1. Register the user normally.
2. In MongoDB, set the user document field `role` to `admin`.

## Folder Overview

- `server.js`: app bootstrap and middleware setup
- `models/`: Mongoose schemas
- `controllers/`: business logic
- `routes/`: API endpoint mappings
- `middleware/`: shared auth and role checks

## Frontend Website Preview (index.html)

For UI preview and user flow context, review these frontend sections:

- Home hero section
- About section
- Menu catalog with add-to-cart controls
- Blog listing with blog detail pages
- Reviews section
- Contact section

Relevant files:

- [index.html](../index.html)
- [stylesheet.css](../stylesheet.css)
- [shop/customer-shop.js](../shop/customer-shop.js)
- [admin-portal/admin-dashboard.html](../admin-portal/admin-dashboard.html)
